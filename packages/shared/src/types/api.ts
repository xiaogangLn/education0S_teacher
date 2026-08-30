export interface ApiResponse<T = unknown> {
    code: number
    message: string
    data: T
  }
  
  export interface ApiError {
    code: number
    message: string
  }