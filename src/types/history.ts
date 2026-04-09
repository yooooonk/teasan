export type HistoryEntry = {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

export type CreateHistoryRequest = {
  title: string
  content: string
}

export type UpdateHistoryRequest = {
  id: string
  title?: string
  content?: string
}

