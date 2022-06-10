const getCircularReplacer = () => {
  const seen = new WeakSet()
  return (_: any, value: any) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value))
        return

      seen.add(value)
    }
    return value
  }
}

function preProcess(...params: any[]) {
  params = params.map((param) => {
    if (typeof param === 'function')
      return `function: ${param.name}`

    if (typeof param === 'object' && param !== null)
      return `object: ${JSON.stringify(param, getCircularReplacer)}`

    return param
  })

  return params
}

export function info(...params: any[]) {
  params = preProcess(...params)
  const willPrint = params.map((param) => {
    return `${param}\n `
  })

  console.info(...willPrint)
}
