import React from 'react'
import { Add } from '@mui/icons-material'
import { IconButton } from '@mui/material'
import { getRouteByAlias } from 'src/utils/getRoutePath'
import { useNavigate } from 'react-router'
import UserAvatarButton from '../UserAvatarButton'

const AddDeviceAndAvatar: React.FC = () => {
  const navigate = useNavigate()

  const goToAddDevice = () => {
    navigate(getRouteByAlias('addDevice').path)
  }

  return (
    <>
      <IconButton aria-label="Add device" onClick={goToAddDevice}>
        <Add />
      </IconButton>
      <UserAvatarButton />
    </>
  )
}

export default AddDeviceAndAvatar
