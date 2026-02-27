import { styled } from '@mui/material'
import React from 'react'
import { AppBar } from 'src/components/AppBar'
import Input from 'src/components/Input'
import DoorEnterIllustration from 'src/components/svg/DoorEnterIllustration'
import { BUTTON_MAX_WIDTH } from 'src/config/constants'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { getRouteByAlias } from 'src/utils/getRoutePath'
import Button from 'src/components/Button'
import { useAppDispatch } from 'src/store/index'
import { setUser, setUserFetchingState } from 'src/store/auth'
import { FetchingState } from 'src/types/FetchingState'
import { useRegisterMutation } from 'src/api/index'

const Root = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(2),
  height: '100%',
}))

const Form = styled('form')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(1),
  width: '100%',
  flex: '1 0',
}))

const Illustration = styled(DoorEnterIllustration)({
  width: '100%',
  height: 'auto',
  maxWidth: BUTTON_MAX_WIDTH,
})

const FillContainer = styled('div')(({ theme }) => ({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  gap: theme.spacing(1),
  alignItems: 'center',
}))

const ColumnContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  gap: theme.spacing(1),
  alignItems: 'center',
  maxWidth: BUTTON_MAX_WIDTH,
}))

const Register: React.FC = () => {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<{
    email: string
    password: string
    firstName: string
    lastName?: string | null
  }>()
  const dispatch = useAppDispatch()
  const [registerUser, { isLoading }] = useRegisterMutation()

  const onSubmit = () => {
    const { email, password, firstName, lastName } = getValues()

    const reject = () => {
      dispatch(setUser(null))
      dispatch(setUserFetchingState(FetchingState.REJECTED))
    }

    dispatch(setUserFetchingState(FetchingState.PENDING))

    registerUser({
      email,
      password,
      firstName,
      lastName: lastName || null,
      avatarUrl: null,
    })
      .unwrap()
      .then((data) => {
        dispatch(setUser(data.user))
        dispatch(setUserFetchingState(FetchingState.FULFILLED))
        navigate(getRouteByAlias('favorites').path)
      })
      .catch(() => {
        return reject()
      })
  }

  const handleGoToLoginClick = () => {
    navigate(getRouteByAlias('login').path)
  }

  return (
    <>
      <AppBar header="Register" />
      <Root>
        <Illustration />
        <Form onSubmit={handleSubmit(onSubmit)}>
          <FillContainer>
            <Input
              placeholder="Email"
              error={!!errors.email}
              type="email"
              fullWidth
              {...register('email', {
                required: true,
              })}
            />
            <Input
              placeholder="Password"
              error={!!errors.password}
              type="password"
              fullWidth
              {...register('password', {
                required: true,
              })}
            />
            <ColumnContainer>
              <Input
                placeholder="First name"
                error={!!errors.firstName}
                type="text"
                autoComplete="given-name"
                fullWidth
                {...register('firstName', {
                  required: true,
                })}
              />
              <Input
                placeholder="Last name"
                error={!!errors.lastName}
                type="text"
                autoComplete="family-name"
                fullWidth
                {...register('lastName', {
                  required: false,
                })}
              />
            </ColumnContainer>
          </FillContainer>
          <Button disabled={isLoading} type="submit">
            Register
          </Button>
        </Form>
        <Button onClick={handleGoToLoginClick} variant="default">
          Log in
        </Button>
      </Root>
    </>
  )
}

export default Register
