const uniqueId = produceUniqueId(0)
export default uniqueId

function produceUniqueId(i) {
  return () => `FEELES_UNIQUE_ID-${++i}`
}
