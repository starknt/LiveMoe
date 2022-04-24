import { combineReducers } from '@reduxjs/toolkit'
import ApplicationConfigurationReducer from 'electron-web/features/applicationSlice'
import PlayerConfigurationReducer from 'electron-web/features/playerSlice'

export default combineReducers({
  playerConfiguration: PlayerConfigurationReducer,
  applicationConfiguration: ApplicationConfigurationReducer,
})
