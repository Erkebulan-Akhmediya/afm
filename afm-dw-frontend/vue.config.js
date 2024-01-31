module.exports = {
  transpileDependencies: [
    'vuetify'
  ],

  devServer: {
  },

  pluginOptions: {
    i18n: {
      locale: 'RUS',
      fallbackLocale: 'KAZ',
      localeDir: 'locales',
      enableInSFC: true
    }
  },

    chainWebpack: config => {
    if (process.env.NODE_ENV != 'development') {
      config.module.rule('vue').uses.delete('cache-loader');
      config.module.rule('js').uses.delete('cache-loader');
      config.module.rule('ts').uses.delete('cache-loader');
      config.module.rule('tsx').uses.delete('cache-loader');
    }
  }
}