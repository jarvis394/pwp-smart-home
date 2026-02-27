import { Avatar } from '@mui/material'
import React from 'react'
import { API_URL } from 'src/config/constants'

type UserAvatarProps = {
  avatarUrl?: string | null
  firstName?: string
}

const UserAvatar: React.FC<UserAvatarProps> = ({ avatarUrl, firstName }) => {
  return (
    <Avatar
      alt="User avatar"
      sx={{ width: 32, height: 32 }}
      src={avatarUrl ? API_URL + avatarUrl : ''}
    >
      {firstName?.[0]}
    </Avatar>
  )
}

export default UserAvatar
