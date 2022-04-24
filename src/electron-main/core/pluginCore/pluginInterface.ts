export interface PluginLifecycle {
  /**
   * @description 应用配置加载完毕
   */
  onReady(): void

  /**
   * @description 加载壁纸资源前
   */
  onBeforeLoadWallpaper(): void

  /**
   * @description 加载壁纸资源后
   */
  onAfterLoadWallpaper(): void

  /**
   * @description 应用准备退出
   */
  onDestroy(): void
}
