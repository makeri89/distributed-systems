import { InfluxDB, FluxTableMetaData } from '@influxdata/influxdb-client'
import { publishMessage } from './mqtt'

const URL = process.env.INFLUX_URL ||''
const TOKEN = process.env.INFLUX_TOKEN || ''
const ORG = process.env.INFLUX_ORG || ''

const influx = new InfluxDB({ url: URL, token: TOKEN })

type Node = {
  result: string
  table: number,
  _time: string,
  _start: string,
  _stop: string,
  sender: string,
  _value: number,
}

// Mean temperature of the last minute per node
const query = `
from(bucket: "temps")
  |> range(start: -10m)
  |> filter(fn: (r) => r["_field"] == "temperature")
  |> group(columns: ["sender"])
  |> aggregateWindow(every: 1m, fn: mean, createEmpty: true)
  |> last()
`

const isNodeinError = (node: Node): boolean => {
  return node._value > 100
}

const queryInfluxDb = async (query: string) => {
  const queryApi = influx.getQueryApi(ORG)

  queryApi.queryRows(query, {
    next(row: string[], tableMeta: FluxTableMetaData) {
      const o = tableMeta.toObject(row) as Node
      let errors = 0
      if (isNodeinError(o)) {
        errors = 1
      }
      publishMessage('error', o.sender, errors)
    },
    error(error) {
      console.error(error)
      console.log('\nFinished ERROR')
    },
    complete() {
      console.log('\nFinished SUCCESS')
    },
  })
}

setInterval(() => queryInfluxDb(query), 10000)