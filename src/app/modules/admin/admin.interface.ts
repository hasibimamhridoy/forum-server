export interface IAdminStats {
  users: {
    total: number
    active: number
    inactive: number
  }
  threads: {
    total: number
    flagged: number
  }
  posts: {
    total: number
    flagged: number
  }
}

export interface IFlagPayload {
  reason?: string
}
