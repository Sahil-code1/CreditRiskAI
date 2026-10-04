import useAsync from '../hooks/useAsync'
import { getPredictionHistory } from '../services/api'
import { Async, PageHeader, Card, DemoNote } from '../components/ui'
import PredictionTable from '../components/PredictionTable'
export default function History() {
  const s = useAsync(getPredictionHistory)
  return (<><PageHeader title="Prediction history" sub="Every scored application" /><DemoNote /><Async s={s}>{(rows) => <Card><PredictionTable rows={rows} showDates /></Card>}</Async></>)
}
