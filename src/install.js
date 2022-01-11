import View from './components/view'
import Link from './components/link'

export let _Vue

export function install (Vue) {
  if (install.installed && _Vue === Vue) return
  install.installed = true

  _Vue = Vue

  const isDef = v => v !== undefined

  const registerInstance = (vm, callVal) => {
    let i = vm.$options._parentVnode
    if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) {
      i(vm, callVal)
    }
  }

  // 所有组件都会混入一下两个生命周期
  Vue.mixin({
    beforeCreate () {
      // 是否根组件：只有根组件的options中有router参数，子组件是没有的
      if (isDef(this.$options.router)) {
        this._routerRoot = this
        this._router = this.$options.router
        // 调用router中定义的init方法
        this._router.init(this)
        // 在根实例上劫持_route属性
        Vue.util.defineReactive(this, '_route', this._router.history.current)
      } else {
        // 子组件
        // 将每一个组件的 _routerRoot 都指向根 Vue 实例
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
      }
      // 注册实例
      registerInstance(this, this)
    },
    destroyed () {
      registerInstance(this)
    }
  })

  // 将$router挂载至Vue原型上
  Object.defineProperty(Vue.prototype, '$router', {
    get () { return this._routerRoot._router }
  })

  // 将$route挂载至Vue原型上
  Object.defineProperty(Vue.prototype, '$route', {
    get () { return this._routerRoot._route }
  })

  // 注册组件
  Vue.component('RouterView', View)
  Vue.component('RouterLink', Link)

  const strats = Vue.config.optionMergeStrategies
  // use the same hook merging strategy for route hooks
  // 定义路由生命周期钩子的合并策略和created的合并策略一致
  strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created
}
