import { makeAutoObservable, runInAction } from 'mobx'
import axios from 'axios'
import type { TradePlan, CreateTradePlanRequest, UpdateTradePlanRequest } from '@federation/shared/types'

class TradePlanStore {
  tradePlans: TradePlan[] = []
  selectedTradePlan: TradePlan | null = null
  isLoading = false
  error: string | null = null
  apiBaseUrl: string

  constructor(apiBaseUrl?: string, authToken?: string) {
    makeAutoObservable(this)
    // Use relative URL so MSW can intercept requests when loaded in portal
    // In production, this would be the actual API base URL
    this.apiBaseUrl = apiBaseUrl || import.meta.env.VITE_API_BASE_URL || '/api'
    this.setupAxiosInterceptor(authToken)
  }

  private setupAxiosInterceptor(_authToken?: string) {
    // Axios interceptor can be set up here if needed
    // Parameter prefixed with _ to indicate intentionally unused
  }

  setAuthToken(token: string | null) {
    // Update axios defaults with new token
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }

  fetchTradePlans = async () => {
    runInAction(() => {
      this.isLoading = true
      this.error = null
    })

    try {
      const url = `${this.apiBaseUrl}/trade-plans`
      const response = await axios.get(url)
      runInAction(() => {
        this.tradePlans = response.data.tradePlans || []
      })
    } catch (error: any) {
      console.error('[TradePlanStore] Error fetching trade plans:', error)
      runInAction(() => {
        this.error = error.response?.data?.message || error.message || 'Failed to fetch trade plans'
      })
      throw error
    } finally {
      runInAction(() => {
        this.isLoading = false
      })
    }
  }

  fetchTradePlanById = async (id: string) => {
    runInAction(() => {
      this.isLoading = true
      this.error = null
    })

    try {
      const response = await axios.get(`${this.apiBaseUrl}/trade-plans/${id}`)
      runInAction(() => {
        this.selectedTradePlan = response.data.tradePlan
      })
      return response.data.tradePlan
    } catch (error: any) {
      runInAction(() => {
        this.error = error.response?.data?.message || error.message || 'Failed to fetch trade plan'
      })
      throw error
    } finally {
      runInAction(() => {
        this.isLoading = false
      })
    }
  }

  createTradePlan = async (data: CreateTradePlanRequest) => {
    runInAction(() => {
      this.isLoading = true
      this.error = null
    })

    try {
      const response = await axios.post(`${this.apiBaseUrl}/trade-plans`, data)
      const newPlan = response.data.tradePlan
      runInAction(() => {
        this.tradePlans.push(newPlan)
        this.selectedTradePlan = newPlan
      })
      return newPlan
    } catch (error: any) {
      runInAction(() => {
        this.error = error.response?.data?.message || error.message || 'Failed to create trade plan'
      })
      throw error
    } finally {
      runInAction(() => {
        this.isLoading = false
      })
    }
  }

  updateTradePlan = async (data: UpdateTradePlanRequest) => {
    runInAction(() => {
      this.isLoading = true
      this.error = null
    })

    try {
      const response = await axios.put(`${this.apiBaseUrl}/trade-plans/${data.id}`, data)
      const updatedPlan = response.data.tradePlan
      runInAction(() => {
        const index = this.tradePlans.findIndex(p => p.id === data.id)
        if (index !== -1) {
          this.tradePlans[index] = updatedPlan
        }
        if (this.selectedTradePlan?.id === data.id) {
          this.selectedTradePlan = updatedPlan
        }
      })
      return updatedPlan
    } catch (error: any) {
      runInAction(() => {
        this.error = error.response?.data?.message || error.message || 'Failed to update trade plan'
      })
      throw error
    } finally {
      runInAction(() => {
        this.isLoading = false
      })
    }
  }

  deleteTradePlan = async (id: string) => {
    runInAction(() => {
      this.isLoading = true
      this.error = null
    })

    try {
      await axios.delete(`${this.apiBaseUrl}/trade-plans/${id}`)
      runInAction(() => {
        this.tradePlans = this.tradePlans.filter(p => p.id !== id)
        if (this.selectedTradePlan?.id === id) {
          this.selectedTradePlan = null
        }
      })
    } catch (error: any) {
      runInAction(() => {
        this.error = error.response?.data?.message || error.message || 'Failed to delete trade plan'
      })
      throw error
    } finally {
      runInAction(() => {
        this.isLoading = false
      })
    }
  }

  pauseTradePlan = async (id: string) => {
    return this.updateTradePlan({ id, status: 'paused' })
  }

  resumeTradePlan = async (id: string) => {
    return this.updateTradePlan({ id, status: 'active' })
  }

  cancelTradePlan = async (id: string) => {
    return this.updateTradePlan({ id, status: 'cancelled' })
  }

  setSelectedTradePlan = (plan: TradePlan | null) => {
    this.selectedTradePlan = plan
  }

  clearError = () => {
    this.error = null
  }
}

export default TradePlanStore

