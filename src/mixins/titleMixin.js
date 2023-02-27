//This is a sample function that extends the vue functionality
function getTitle (vm) {
  const { title } = vm.$options
  if (title) {
    return typeof title === 'function'
      ? title.call(vm)
      : title
  }
}

export default {
  created () {
    const title = getTitle(this)
    if (title) {
      document.title = title
    }
  }
}
