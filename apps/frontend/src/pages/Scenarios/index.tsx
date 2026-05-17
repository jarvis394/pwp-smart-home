import { AutoAwesomeOutlined } from '@mui/icons-material'
import { alpha, ButtonBase, styled } from '@mui/material'
import React, { useMemo } from 'react'
import { generatePath, useNavigate } from 'react-router'
import { AppBar } from 'src/components/AppBar'
import Switch from 'src/components/Switch'
import { getRouteByAlias } from 'src/utils/getRoutePath'
import { useGetScenariosQuery, useSetScenarioStateMutation } from 'src/api'
import FullScreenSpinner from 'src/components/FullScreenSpinner'
import { PlaceholderRoot } from '../Favorites'
import NoDevicesIllustration from 'src/components/svg/NoDevicesIllustration'
import type { Scenario } from '@smart-home/db/schema'
import AddScenarioAndAvatar from 'src/components/AddScenarioAndAvatar'

const SCENARIO_CARD_HEIGHT = 72

const ScenarioCardRoot = styled(ButtonBase)(({ theme }) => ({
  borderRadius: 20,
  padding: theme.spacing(1.5, 2),
  backgroundColor: theme.palette.background.default,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  fontFamily: theme.typography.fontFamily,
  width: '100%',
  minHeight: SCENARIO_CARD_HEIGHT,
  cursor: 'pointer',
  transition: 'background-color 150ms ease',
  userSelect: 'none',
  textAlign: 'initial',
  '&.ScenarioCard--active': {
    backgroundColor: alpha(theme.palette.primaryVibrant.main, 0.16),
  },
}))

const ScenarioIconContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 40,
  height: 40,
  borderRadius: 12,
  backgroundColor: alpha(theme.palette.text.primary, 0.08),
  color: theme.palette.text.secondary,
  transition: 'background-color 150ms ease',
  flexShrink: 0,
  '&.ScenarioIconContainer--active': {
    backgroundColor: alpha(theme.palette.primaryVibrant.main, 0.16),
    color: theme.palette.primaryVibrant.dark,
  },
}))

const ScenarioInfo = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  flex: 1,
  minWidth: 0,
})

const ScenarioName = styled('h3')(({ theme }) => ({
  margin: 0,
  fontSize: 15,
  fontWeight: 500,
  lineHeight: '20px',
  color: theme.palette.text.primary,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}))

const ScenarioSubtitle = styled('p')(({ theme }) => ({
  margin: 0,
  fontSize: 13,
  lineHeight: '17px',
  color: theme.palette.text.hint,
}))

const ListContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  padding: theme.spacing(1, 2),
  paddingBottom: theme.spacing(2),
}))

type ScenarioCardProps = {
  scenario: Scenario
  onToggle: (scenario: Scenario, active: boolean) => void
  onClick: (scenario: Scenario) => void
}

const ScenarioCard: React.FC<ScenarioCardProps> = ({
  scenario,
  onToggle,
  onClick,
}) => {
  const handleToggle = (
    e: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    e.stopPropagation()
    onToggle(scenario, checked)
  }

  const handleClick = () => {
    onClick(scenario)
  }

  const handleSwitchClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const actionsCount = Array.isArray(scenario.actions)
    ? scenario.actions.length
    : 0

  return (
    <ScenarioCardRoot
      onClick={handleClick}
      className={scenario.isActive ? 'ScenarioCard--active' : ''}
    >
      <ScenarioIconContainer
        className={scenario.isActive ? 'ScenarioIconContainer--active' : ''}
      >
        <AutoAwesomeOutlined sx={{ width: 22, height: 22 }} />
      </ScenarioIconContainer>
      <ScenarioInfo>
        <ScenarioName>{scenario.name}</ScenarioName>
        <ScenarioSubtitle>
          {actionsCount} {actionsCount === 1 ? 'action' : 'actions'} •{' '}
          {scenario.isActive ? 'Active' : 'Inactive'}
        </ScenarioSubtitle>
      </ScenarioInfo>
      <div onClick={handleSwitchClick}>
        <Switch
          checked={scenario.isActive}
          onChange={handleToggle}
          inputProps={{ 'aria-label': `Toggle ${scenario.name}` }}
        />
      </div>
    </ScenarioCardRoot>
  )
}

const Placeholder = () => (
  <PlaceholderRoot>
    <NoDevicesIllustration />
    <p>Create your first automation scenario</p>
  </PlaceholderRoot>
)

const Scenarios: React.FC = () => {
  const navigate = useNavigate()
  const { data: scenarios, isSuccess, isLoading } = useGetScenariosQuery({})
  const [setScenarioState] = useSetScenarioStateMutation()

  const sortedScenarios = useMemo(() => {
    if (!scenarios) return []
    return [...scenarios].sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
      if (aTime !== bTime) return aTime - bTime
      return a.id.localeCompare(b.id)
    })
  }, [scenarios])

  const handleScenarioClick = (scenario: Scenario) => {
    navigate(
      generatePath(getRouteByAlias('scenarioDetails').path, {
        id: scenario.id,
      })
    )
  }

  const handleToggle = (scenario: Scenario, active: boolean) => {
    setScenarioState({ id: scenario.id, active })
  }

  const appBar = useMemo(
    () => (
      <AppBar fixed header="Scenarios" toolbar={<AddScenarioAndAvatar />} />
    ),
    []
  )

  if (isLoading) {
    return (
      <>
        {appBar}
        <FullScreenSpinner />
      </>
    )
  }

  if (isSuccess && sortedScenarios.length === 0) {
    return (
      <>
        {appBar}
        <Placeholder />
      </>
    )
  }

  return (
    <>
      {appBar}
      <ListContainer>
        {sortedScenarios.map((scenario) => (
          <ScenarioCard
            key={scenario.id}
            scenario={scenario}
            onToggle={handleToggle}
            onClick={handleScenarioClick}
          />
        ))}
      </ListContainer>
    </>
  )
}

export default Scenarios
