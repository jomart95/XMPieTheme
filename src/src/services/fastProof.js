import { UStoreProvider } from '@ustore/core'

const GET_FETCH_PROOF_INTERVAL = 300
const WAIT_AFTER_PROOF_FAILURE = 1000

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

//
// this service is used to prevent multiple proof requests in a short time
// and to only call the last proof for the file names
// it also prevents proof requests if there is a proof in progress
//
class ProofService {

  constructor () {
    this.current = null
    this.next = null
    this.ready = true
    this.onProof = null
    this.onError = null
  }

  timeoutCall = (params) => {
    if (this.ready) {
      if (!this.current) {
        this.current = params
      }
      this.proof()
    } else {
      this.timeoutCall(params)
    }
  }

  breakCurrentLoop = () => {
    this.current = this.next
    this.next = null
    this.ready = true
    this.timeoutCall(this.current)
  }

  async proof () {
    try {
      if (this.current) {
        this.ready = false
        let result = await UStoreProvider.api.products.createProofPreview(...this.current)
        // if proof is still in progress, wait and check again
        while (result && result.Status === 1) {
          await wait(GET_FETCH_PROOF_INTERVAL)
          result = await UStoreProvider.api.products.getProofPreview(this.current[0], result.PreviewID)
          //if we have another proof request, break the loop and start the new one with the new params
          if (this.next) {
            this.breakCurrentLoop()
            return
          }
        }

        // if we have another proof request, process it
        this.current = this.next
        this.next = null

        this.ready = true
        if (this.current) {
          this.timeoutCall(this.current)
          return
        }
        //notify the caller that the proof is ready
        this.onProof && this.onProof(result)
      }
    } catch (e) {
      if (e.Message?.toLowerCase() === 'too much requests.') {
        await wait(WAIT_AFTER_PROOF_FAILURE)
        this.current = this.next || this.current
        this.next = null
        this.ready = true
        this.timeoutCall(this.current)
        return
      }
      this.current = null
      this.next = null
      this.ready = true
      this.onError && this.onError(e)
    }
  }

  push (params) {
    if (!this.ready) {
      this.next = params
    } else {
      this.timeoutCall(params)
    }

  }

}

const proofService = new ProofService()
export default proofService
