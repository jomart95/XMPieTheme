import { UStoreProvider } from '@ustore/core'

const ACTIVITY_CHECK_INTERVAL = 2000
export const ActivityStatus = {
  Progress: 1,
  Success: 2,
  Failed: 3,
  PartiallyFailed: 4
}

export const ActivityType = {
  OrderItemDuplication: 1,
  KitOrderItemDuplication: 2,
  CartListDuplication: 3,
  OrderItemReordering: 4,
  KitOrderItemReordering: 5,
  OrderReordering: 6,
  GenerateProofSet: 7,
}

class ActivityMonitor {

  constructor () {
    this._activities = {}
    this._subsdcribers = []
  }

  setModel (model) {
    this._model = model
  }

  subscribe (callback) {
    this._subsdcribers.push(callback)
  }

  unsubscribe (callback) {
    this._subsdcribers = this._subsdcribers.filter(subscriber => subscriber !== callback)
  }

  async checkActivities () {
    try {
      const activityIds = Object.entries(this._activities)
        .filter(([activityId, activity]) => activity.activity === undefined || activity.Status !== ActivityStatus.Progress)
        .map(([activityId, activity]) => activityId)

      if (activityIds.length === 0) {
        return
      }

      const activitiesStatus = await UStoreProvider.api.activities.getActivities(activityIds)
      const activities = Array.isArray(activitiesStatus) ? activitiesStatus : [activitiesStatus]
      activities.forEach(activity => this._activities[activity.ActivityID].activity = activity)

      this._subsdcribers.forEach(callback => callback(this._activities))
      if (this._model) {
        this._model.setActivities(this._activities)
      }

      if (Object.values(this._activities).some(activity => activity.activity?.Status === ActivityStatus.Progress)) {
        setTimeout(() => this.checkActivities(), ACTIVITY_CHECK_INTERVAL)
      }
    } catch (e) {
      console.error(e)
      setTimeout(() => this.checkActivities(), ACTIVITY_CHECK_INTERVAL)
    }
  }

  addActivity (activityId, entityId) {
    this._activities[activityId] = { entityId }
    this.checkActivities()
  }

  addActivityList(activities) {
    if (Array.isArray(activities)) {
      activities.forEach(activity => {
        if (!this._activities[activity]) {
          this._activities[activity] = { entityId: null }
        }
      })
      this.checkActivities()
      return
    }
    console.error('addActivityList: activities is not an array')

  }

  clearActivities () {
    this._activities = {}
  }

}

const activityMonitor = new ActivityMonitor()
export default activityMonitor
