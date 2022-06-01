export interface ChangeRepositoryEvent {
  type: 'success' | 'error' | 'cancel'
  repositoryPath: string
}

export interface MoveRepositoryEvent {
  type: 'success' | 'error' | 'cancel'
  repositoryPath: string
}
