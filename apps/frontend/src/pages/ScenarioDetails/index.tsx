import {
  Button as MUIButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  alpha,
  TextField as MUITextField,
  styled,
} from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { AppBarExtended } from 'src/components/AppBar'
import { getRouteByAlias } from 'src/utils/getRoutePath'
import {
  useGetScenarioQuery,
  useDeleteScenarioMutation,
  useUpdateScenarioMutation,
  useSetScenarioStateMutation,
} from 'src/api'
import FullScreenSpinner from 'src/components/FullScreenSpinner'
import { DeleteOutlined, EditOutlined } from '@mui/icons-material'
import Switch from 'src/components/Switch'
import { useSnackbar } from 'src/hooks/useSnackbar'
import { BUTTON_MAX_WIDTH } from 'src/config/constants'
import { Scenario } from '@smart-home/db/schema'
import { ScenarioUpdateReq } from '@smart-home/shared'
import { getOnOffText } from 'src/components/DeviceCard'

const Root = styled('div')(({ theme }) => ({
  padding: theme.spacing(1, 2),
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2),
}))

const OnOffButton = styled('label')(({ theme }) => ({
  padding: theme.spacing(1.25, 2),
  paddingRight: theme.spacing(1.25),
  borderRadius: 100,
  boxShadow: '0 0 0 2px inset ' + alpha(theme.palette.text.primary, 0.12),
  fontFamily: theme.typography.fontFamily,
  fontSize: 15,
  fontWeight: 500,
  lineHeight: '20px',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  ...theme.mixins.button,
  '&:active': {
    transform: 'none',
  },
}))

const SectionCard = styled('div')(({ theme }) => ({
  borderRadius: 20,
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
  width: '100%',
  maxWidth: BUTTON_MAX_WIDTH,
}))

const SectionTitle = styled('h3')(({ theme }) => ({
  margin: 0,
  fontSize: 13,
  fontWeight: 600,
  lineHeight: '17px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  color: theme.palette.text.hint,
}))

const ActionItem = styled('div')(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(1.5),
  backgroundColor: alpha(theme.palette.text.primary, 0.04),
  fontSize: 14,
  fontWeight: 400,
  lineHeight: '18px',
  color: theme.palette.text.secondary,
  fontFamily: 'monospace',
  wordBreak: 'break-all',
}))

const EmptyActions = styled('p')(({ theme }) => ({
  margin: 0,
  fontSize: 14,
  color: theme.palette.text.hint,
  textAlign: 'center',
  padding: theme.spacing(2, 0),
}))

type ScenarioDetailsPageParams = {
  id: string
}

type ConfirmDeleteModalProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete this scenario?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <MUIButton onClick={onClose} sx={{ color: 'text.secondary' }} autoFocus>
          Cancel
        </MUIButton>
        <MUIButton onClick={onConfirm} color="error">
          Delete
        </MUIButton>
      </DialogActions>
    </Dialog>
  )
}

type EditScenarioModalProps = {
  open: boolean
  onClose: () => void
  onConfirm: (scenario: ScenarioUpdateReq['body']) => void
  scenario: Scenario
}

const EditScenarioModal: React.FC<EditScenarioModalProps> = ({
  open,
  onClose,
  onConfirm,
  scenario,
}) => {
  const $input = useRef<HTMLInputElement>(null)

  const handleSave = () => {
    const value = $input.current?.value?.trim()
    if (!value) return

    onConfirm({ name: value })
    onClose()
  }

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <DialogTitle>Edit scenario</DialogTitle>
      <DialogContent>
        <MUITextField
          autoFocus
          fullWidth
          type="text"
          color="primaryVibrant"
          defaultValue={scenario.name}
          inputRef={$input}
          placeholder="Scenario name"
        />
      </DialogContent>
      <DialogActions>
        <MUIButton onClick={onClose} sx={{ color: 'text.secondary' }} autoFocus>
          Cancel
        </MUIButton>
        <MUIButton onClick={handleSave} color="primaryVibrant">
          Save
        </MUIButton>
      </DialogActions>
    </Dialog>
  )
}

const ScenarioDetails: React.FC = () => {
  const [isConfirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false)
  const [isEditScenarioModalOpen, setEditScenarioModalOpen] = useState(false)
  const [deleteScenario] = useDeleteScenarioMutation()
  const [updateScenario] = useUpdateScenarioMutation()
  const [setScenarioState] = useSetScenarioStateMutation()
  const navigate = useNavigate()
  const { id = '' } = useParams<ScenarioDetailsPageParams>()
  const {
    data: scenario,
    isSuccess,
    isLoading,
  } = useGetScenarioQuery({ id }, { skip: !id })
  const { showSnackbar, SnackbarComponent } = useSnackbar()

  useEffect(() => {
    if (!scenario && isSuccess) {
      navigate(getRouteByAlias('scenarios').path)
    }
  }, [scenario, isSuccess, navigate])

  const handleDelete = () => {
    deleteScenario({ id })
      .unwrap()
      .then(() => {
        navigate(getRouteByAlias('scenarios').path)
      })
      .catch((e) => {
        showSnackbar(e?.data?.message || 'Failed to delete scenario', 'error')
      })
  }

  const handleToggleState = (
    _e: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    setScenarioState({ id, active: checked })
      .unwrap()
      .catch((e) => {
        showSnackbar(
          e?.data?.message || 'Failed to toggle scenario state',
          'error'
        )
      })
  }

  const handleSave = (scenario: ScenarioUpdateReq['body']) => {
    updateScenario({ id, body: scenario })
      .unwrap()
      .then(() => {
        showSnackbar('Scenario updated', 'success')
      })
      .catch((e) => {
        showSnackbar(e?.data?.message || 'Failed to update scenario', 'error')
      })
  }

  if (isLoading || !scenario) {
    return <FullScreenSpinner />
  }

  const actions = Array.isArray(scenario.actions) ? scenario.actions : []

  return (
    <>
      <AppBarExtended
        fixed
        toolbar={
          <>
            <IconButton onClick={() => setConfirmDeleteModalOpen(true)}>
              <DeleteOutlined />
            </IconButton>
            <IconButton onClick={() => setEditScenarioModalOpen(true)}>
              <EditOutlined />
            </IconButton>
          </>
        }
        withBackButton
        header={scenario.name}
      />
      <Root>
        <ConfirmDeleteModal
          onClose={() => setConfirmDeleteModalOpen(false)}
          onConfirm={() => {
            handleDelete()
            setConfirmDeleteModalOpen(false)
          }}
          open={isConfirmDeleteModalOpen}
        />
        <EditScenarioModal
          onClose={() => setEditScenarioModalOpen(false)}
          onConfirm={(newScenario) => {
            handleSave(newScenario)
            setEditScenarioModalOpen(false)
          }}
          open={isEditScenarioModalOpen}
          scenario={scenario}
        />

        <SectionCard>
          <SectionTitle>Actions</SectionTitle>
          {actions.length === 0 && (
            <EmptyActions>No actions configured yet</EmptyActions>
          )}
          {actions.map((action, index) => (
            <ActionItem key={index}>
              {JSON.stringify(action, null, 2)}
            </ActionItem>
          ))}
        </SectionCard>

        <OnOffButton htmlFor="on-off-switch">
          {getOnOffText(scenario.isActive)}
          <Switch
            onChange={handleToggleState}
            checked={scenario.isActive}
            inputProps={{ 'aria-label': 'controlled' }}
            id="on-off-switch"
          />
        </OnOffButton>
      </Root>
      {SnackbarComponent}
    </>
  )
}

export default ScenarioDetails
