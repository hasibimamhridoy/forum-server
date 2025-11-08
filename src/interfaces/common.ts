import { iErrorMessages } from './error'

export type IGenericErrorResponse = {
  status: number
  message: string
  errorMessages: iErrorMessages[]
}

export type TQuery = {
  page?: number
  limit?: number
  sort?: string
  search?: string
  category?: string
}
