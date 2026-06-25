// 角色权限集中在这里，避免各页面各写一套过滤规则。
export function getAccessibleLogs(role, user, logs) {
  if (!Array.isArray(logs)) return []

  if (role === 'student') {
    return logs.filter((log) => log.studentNo === user.studentNo)
  }

  if (role === 'teacher') {
    return logs.filter((log) => log.className === user.className)
  }

  return [...logs]
}

export function canAccessLog(role, user, log) {
  if (!log) return false

  if (role === 'student') {
    return log.studentNo === user.studentNo
  }

  if (role === 'teacher') {
    return log.className === user.className
  }

  return role === 'admin'
}

export function getVisibleNotifications(role, user, notifications) {
  if (!Array.isArray(notifications)) return []

  return notifications.filter((notification) => {
    const targetRole = resolveNotificationTargetRole(notification)
    if (!targetRole) return true

    if (role === 'student') {
      if (targetRole !== 'student') return false
      return !notification.targetStudentNo || notification.targetStudentNo === user.studentNo
    }

    if (role === 'teacher') {
      if (targetRole !== 'teacher') return false
      return !notification.targetClassName || notification.targetClassName === user.className
    }

    if (role === 'admin') {
      return targetRole === 'admin'
    }

    return false
  })
}

function resolveNotificationTargetRole(notification) {
  if (notification.targetRole) return notification.targetRole
  if (notification.targetStudentNo) return 'student'
  if (notification.targetClassName) return 'teacher'
  if (notification.targetAdmin === true) return 'admin'
  // 缺少目标字段时默认隐藏，防止历史脏数据误展示给所有人。
  if (!('targetRole' in notification)) return '__unknown__'
  return ''
}
