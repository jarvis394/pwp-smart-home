import {
  BrightnessHighOutlined,
  BrightnessLowOutlined,
} from '@mui/icons-material'
import { Box, sliderClasses, styled } from '@mui/material'
import React, { useMemo, useState, useEffect, useCallback } from 'react'
import Slider from 'src/components/Slider'
import Tabs, { TabsChangeHandler } from 'src/components/Tabs'
import { ArrayElement } from 'src/types/ArrayElement'
import { LightBulb, DeviceCapabilityType } from '@smart-home/db/types'
import exhaustivnessCheck from 'src/utils/exhaustivnessCheck'
import { useUpdateDeviceStateMutation } from 'src/api/index'
import { useSnackbar } from 'src/hooks/useSnackbar'

const VERTICAL_SLIDER_HEIGHT = 336

const Root = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
})

const GradientSlider = styled(Slider)({
  [`& .${sliderClasses.vertical} .${sliderClasses.rail}`]: {
    background: 'linear-gradient(180deg, var(--gradient))',
  },
  [`& .${sliderClasses.rail}`]: {
    background: 'linear-gradient(270deg, var(--gradient))',
  },
})

const WarmLightSlider = styled(GradientSlider)(({ theme }) => ({
  color: theme.palette.background.paper,
  '--gradient': '#FFB100 0%, #FFE88C 100%',
}))

const ColdLightSlider = styled(GradientSlider)({
  color: '#6080bc',
  '--gradient': '#9FBDF7 0%, #F4F8FF 100%',
})

const RainbowSlider = styled(GradientSlider)({
  '--gradient': `rgba(255, 0, 0, 1) 0%,
      rgba(255, 154, 0, 1) 10%,
      rgba(208, 222, 33, 1) 20%,
      rgba(79, 220, 74, 1) 30%,
      rgba(63, 218, 216, 1) 40%,
      rgba(47, 201, 226, 1) 50%,
      rgba(28, 127, 238, 1) 60%,
      rgba(95, 21, 242, 1) 70%,
      rgba(186, 12, 248, 1) 80%,
      rgba(251, 7, 217, 1) 90%,
      rgba(255, 0, 0, 1) 100%`,
  [`& .${sliderClasses.thumb}`]: {
    backgroundColor: 'var(--thumbBackgroundColor) !important',
  },
})

const COLOR_MODES = ['warm_light', 'cold_light', 'hsv'] as const
type ColorMode = ArrayElement<typeof COLOR_MODES>

const ColorSetting: React.FC<{ device: LightBulb }> = ({ device }) => {
  const [updateDeviceState] = useUpdateDeviceStateMutation()
  const { showSnackbar, SnackbarComponent } = useSnackbar()

  const [selectedColorMode, setSelectedColorMode] = useState<ColorMode>(() => {
    const state = device.capabilities[DeviceCapabilityType.COLOR_SETTING]?.state
    if (state?.instance === 'hsv') return 'hsv'
    if (state?.instance === 'temperature_k') {
      return state.value < 4500 ? 'warm_light' : 'cold_light'
    }
    return 'hsv'
  })

  const [value, setValue] = useState<number>(() => {
    const state = device.capabilities[DeviceCapabilityType.COLOR_SETTING]?.state
    if (state?.instance === 'hsv') return state.value.h
    if (state?.instance === 'temperature_k') return state.value
    return 180
  })

  // Synchronize component state with updated device data from server
  useEffect(() => {
    const state = device.capabilities[DeviceCapabilityType.COLOR_SETTING]?.state
    if (state?.instance === 'hsv') {
      setSelectedColorMode('hsv')
      setValue(state.value.h)
    } else if (state?.instance === 'temperature_k') {
      setSelectedColorMode(state.value < 4500 ? 'warm_light' : 'cold_light')
      setValue(state.value)
    }
  }, [device])

  const sendColorUpdate = useCallback(
    (mode: ColorMode, val: number) => {
      const colorState =
        mode === 'hsv'
          ? {
              instance: 'hsv' as const,
              value: { h: val, s: 1, v: 1 },
            }
          : {
              instance: 'temperature_k' as const,
              value: val,
            }

      updateDeviceState({
        id: device.id,
        body: {
          capabilities: {
            [DeviceCapabilityType.COLOR_SETTING]: {
              type: DeviceCapabilityType.COLOR_SETTING,
              state: colorState,
            },
          },
        },
      })
        .unwrap()
        .catch((e: { data?: { message?: string }; message?: string }) => {
          showSnackbar(
            e?.data?.message || e?.message || 'Failed to update color setting',
            'error'
          )
        })
    },
    [device, updateDeviceState, showSnackbar]
  )

  const handleSliderChange = useCallback(
    (_event: Event, newValue: number | number[]) => {
      if (Array.isArray(newValue)) return
      setValue(newValue)
    },
    []
  )

  const handleSliderChangeCommitted = useCallback(
    (_event: React.SyntheticEvent | Event, newValue: number | number[]) => {
      if (Array.isArray(newValue)) return
      sendColorUpdate(selectedColorMode, newValue)
    },
    [selectedColorMode, sendColorUpdate]
  )

  const handleTabsChange: TabsChangeHandler = useCallback(
    (_event, val) => {
      const mode = val as ColorMode
      setSelectedColorMode(mode)

      let defaultVal = 180
      if (mode === 'warm_light') {
        defaultVal = 3000
      } else if (mode === 'cold_light') {
        defaultVal = 5500
      }

      setValue(defaultVal)
      sendColorUpdate(mode, defaultVal)
    },
    [sendColorUpdate]
  )

  const SliderComponent = useMemo(() => {
    switch (selectedColorMode) {
      case 'hsv':
        return (
          <RainbowSlider
            style={{
              ['--thumbBackgroundColor' as string]: `hsl(${
                360 - value
              }deg 100% 50%)`,
            }}
            orientation="vertical"
            min={0}
            max={360}
            step={1}
            onChange={handleSliderChange}
            onChangeCommitted={handleSliderChangeCommitted}
            value={value}
          />
        )
      case 'warm_light':
        return (
          <WarmLightSlider
            iconBefore={
              <BrightnessHighOutlined sx={{ width: 32, height: 32 }} />
            }
            iconAfter={<BrightnessLowOutlined sx={{ width: 32, height: 32 }} />}
            orientation="vertical"
            min={2700}
            max={4500}
            step={10}
            onChange={handleSliderChange}
            onChangeCommitted={handleSliderChangeCommitted}
            value={value}
          />
        )
      case 'cold_light':
        return (
          <ColdLightSlider
            iconBefore={
              <BrightnessHighOutlined sx={{ width: 32, height: 32 }} />
            }
            iconAfter={<BrightnessLowOutlined sx={{ width: 32, height: 32 }} />}
            orientation="vertical"
            min={4500}
            max={6500}
            step={10}
            onChange={handleSliderChange}
            onChangeCommitted={handleSliderChangeCommitted}
            value={value}
          />
        )
      default:
        return exhaustivnessCheck(selectedColorMode)
    }
  }, [
    selectedColorMode,
    value,
    handleSliderChange,
    handleSliderChangeCommitted,
  ])

  return (
    <>
      <Root>
        <Tabs
          items={[
            { label: 'Warm light', value: 'warm_light' },
            { label: 'Cold light', value: 'cold_light' },
            { label: 'Manual', value: 'hsv' },
          ]}
          value={selectedColorMode}
          onChange={handleTabsChange}
        />
        <Box sx={{ height: VERTICAL_SLIDER_HEIGHT }}>{SliderComponent}</Box>
      </Root>
      {SnackbarComponent}
    </>
  )
}

export default ColorSetting
