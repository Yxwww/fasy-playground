const FA = require('fasy')

const prop = p => o => o[p]

const delay = duration => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, duration)
  })
}

const fetch = async (url, responseTime = 1000, isThrowing = false) => {
  return delay(responseTime).then(() => {
    if (isThrowing) {
      throw new Error(`fetch ${url}-responseTime throwing a exception`)
    }
    console.log(`${url} has responded. Took ${responseTime}ms.`)
    return { url, responseTime, data: `data for ${url} - ${responseTime}` }
  })
}

const requestData = [['1', 2000], ['2', 500, true]]

async function serialMap () {
  await FA.serial.map(
    ([url, responseTime]) => fetch(url, responseTime),
    requestData
  )
}

async function concurrentMap () {
  const result = await FA.concurrent.map(
    (args) => fetch(...args).catch(e => {
      console.log('catching in map call', e) // catch exception at highest level
      return { status: 'failed' }
    }),
    requestData
  )

  console.log('concurrent', { result })
}

function interval (duration = 1000) {
  let index = 0
  let subscriber = null

  const interval = setInterval(() => {
    // yield index ++;
    subscriber(++index)
  }, duration)

  return {
    subscribe: fn => {
      subscriber = fn
      return () => {
        clearInterval(interval)
      }
    }
  }
}

// async function pipeDemo () {
//   const result = await FA.serial.pipe([
//     ([url, time]) => fetch(url, time),
//     async data => {
//       console.log('in delay')
//       const result = await delay(5000).then(() => data)
//       console.log(result)
//       return result
//     },
//     prop('data')
//   ])(['1', 1000])
//   console.log({ result })
// }

// pipeDemo()
// serialMap()
// concurrentMap()

const unsubscribe = interval(500).subscribe(i => {
  console.log(i)
})

delay(5000).then(() => {
  unsubscribe()
})
