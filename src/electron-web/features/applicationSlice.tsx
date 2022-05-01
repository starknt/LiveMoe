import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { IApplicationConfiguration } from 'common/electron-common/application'
import { retry } from 'common/electron-common/utils'
import type { rootStore } from 'electron-web/store/store'

export const enum InitalizeState {
  INITIALIZING = 'INITIALIZING',
  LOADING = 'LOADING',
  UNINITIALIZING = 'UNINITLIZING',
}

const initialState: IApplicationConfiguration & { state: InitalizeState } = {
  state: InitalizeState.UNINITIALIZING,
  selfStartup: false,
  autoUpdate: false,
  resourcePath: '',
  coldStartup: false,
  closeAction: {
    dialog: false,
    action: 'hide',
  },
  updateTips: false,
  mode: 'normal',
  application: {
    name: 'Livemoe',
    description: '',
    version: {
      app: 'v1.0.0',
      chrome: 'v1.0.0',
      electron: 'v1.0.0',
      node: 'v1.0.0',
      v8: 'v1.0.0',
    },
  },
}

export const initalizeApplicationState = createAsyncThunk(
  'application-configuration/initalize',
  async() =>
    await retry(
      async() => {
        const configuration
          = await livemoe.applicationService.getConfiguration()

        console.log(configuration)

        return configuration
      },
      3,
      50,
    ),
)

const applicationConfiguration = createSlice({
  name: 'application-configuration',
  initialState,
  reducers: {
    updateConfigurationAll: (state, action) => {
      const {
        application,
        autoUpdate,
        closeAction,
        coldStartup,
        mode,
        resourcePath,
        selfStartup,
        updateTips,
      } = action.payload
      state.application = application
      state.autoUpdate = autoUpdate
      state.closeAction = closeAction
      state.coldStartup = coldStartup
      state.mode = mode
      state.resourcePath = resourcePath
      state.selfStartup = selfStartup
      state.updateTips = updateTips
    },
  },
  extraReducers: (builder) => {
    builder.addCase(initalizeApplicationState.pending, (state) => {
      console.log('加载应用状态中...')
      state.state = InitalizeState.LOADING
    })
    builder.addCase(initalizeApplicationState.fulfilled, (state, action) => {
      console.log('获取应用状态成功', state, action)
      state.state = InitalizeState.INITIALIZING
      const {
        application,
        autoUpdate,
        closeAction,
        coldStartup,
        mode,
        resourcePath,
        selfStartup,
        updateTips,
      } = action.payload
      state.application = application
      state.autoUpdate = autoUpdate
      state.closeAction = closeAction
      state.coldStartup = coldStartup
      state.mode = mode
      state.resourcePath = resourcePath
      state.selfStartup = selfStartup
      state.updateTips = updateTips
    })
    builder.addCase(initalizeApplicationState.rejected, (state) => {
      console.log('尝试加载应用状态失败, 准备重试...')
      state.state = InitalizeState.UNINITIALIZING
    })
  },
})

export const { updateConfigurationAll } = applicationConfiguration.actions

export const selectApplicationConfiguration = (state: rootStore) => state.applicationConfiguration

const ApplicationConfigurationReducer = applicationConfiguration.reducer

export default ApplicationConfigurationReducer
