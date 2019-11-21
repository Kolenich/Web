import {
  Avatar,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  CssBaseline,
  FormControlLabel,
  Grid,
  Link,
  TextField,
  Typography,
  Zoom,
} from '@material-ui/core';
import { LockOutlined } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import { AxiosResponse } from 'axios';
import { Context } from 'context';
import { IContext } from 'context/types';
import api from 'lib/api';
import { USERS_APP } from 'lib/session';
import { useSnackbar } from 'notistack';
import React, { ChangeEvent, FC, memo, useContext, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { SERVER_NOT_AVAILABLE } from '../../lib/constants';
import styles from './styles';
import { IAccount, IErrors, IProps } from './types';

const useStyles = makeStyles(styles);

/**
 * Компонент станицы регистрации
 * @param {History<LocationState>} history история в браузере
 * @returns {JSX.Element}
 * @constructor
 */
const SignUpPage: FC<IProps> = ({ history }) => {
  const classes = useStyles();

  const { enqueueSnackbar } = useSnackbar();

  const { getters } = useContext<IContext>(Context);

  // Набор переменных состояния для пользовательских данных
  const [account, setAccount] = useState<IAccount>({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    mailing: false,
  });

  // Переменная состояния для загрузки
  const [loading, setLoading] = useState<boolean>(false);

  // Переменная состояния загрузки страницы
  const [mounted, setMounted] = useState<boolean>(false);

  // Набор переменных состояния для ошибок
  const [errors, setErrors] = useState<IErrors>({
    email: false,
    last_name: false,
    first_name: false,
    password: false,
  });

  /**
   * Функция обработки изменений в текстовом поле
   * @param {React.ChangeEvent<HTMLInputElement>} event событие изменения
   */
  const handleTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setAccount((oldAccount: IAccount) => ({ ...oldAccount, [name]: value }));
  };

  /**
   * Функция обработки изменений булевских значений
   * @param {React.ChangeEvent<HTMLInputElement>} event событие изменения
   */
  const handleBooleanChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setAccount((oldAccount: IAccount) => ({ ...oldAccount, [name]: checked }));
  };

  /**
   * Функция для сброса ошибок в полях
   */
  const resetErrors = () => (
    setErrors(() => ({ email: false, first_name: false, last_name: false, password: false }))
  );

  /**
   * Функция отправки формы
   */
  const handleSubmit = async () => {
    setLoading(() => true);
    const { email, first_name, last_name, password, mailing } = account;
    const sendData: IAccount = { email, password, first_name, last_name, mailing };
    try {
      const response: AxiosResponse = await api.sendContent('user/registrate', sendData, USERS_APP);
      const { message } = response.data;
      enqueueSnackbar(message, { variant: 'success' });
      // Через 2 секунды перенаправляем на страницу входа
      setTimeout(() => history.push({ pathname: '/sign-in' }), 2000);
    } catch (error) {
      let message = SERVER_NOT_AVAILABLE;
      if (error.response) {
        const { errors: errorsList } = error.response.data;
        message = error.response.data.message;
        setErrors((oldErrors: IErrors): IErrors => ({ ...oldErrors, ...errorsList }));
      }
      enqueueSnackbar(message, { variant: 'error' });
      // Через 3 секунды гасим ошибки
      setTimeout(resetErrors, 3000);
      setLoading(() => false);
    }
  };

  useEffect(
    () => {
      document.title = `${getters.documentTitle} | Зарегистрироваться в системе`;
    },
    [getters.documentTitle],
  );

  useEffect(() => setMounted(true), []);

  return (
    <Zoom in={mounted} timeout={750}>
      <Container component="main" maxWidth="sm">
        <CssBaseline />
        <Typography component="div" className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlined />
          </Avatar>
          <Typography component="h1" variant="h5">
            Зарегистрироваться
          </Typography>
          <Typography component="form" className={classes.form}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="first_name"
                  variant="outlined"
                  required
                  fullWidth
                  error={errors.first_name}
                  label="Имя"
                  value={account.first_name}
                  onChange={handleTextChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  label="Фамилия"
                  error={errors.last_name}
                  name="last_name"
                  value={account.last_name}
                  onChange={handleTextChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  label="Электронная почта"
                  error={errors.email}
                  name="email"
                  autoComplete="email"
                  value={account.email}
                  onChange={handleTextChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  error={errors.password}
                  name="password"
                  label="Пароль"
                  type="password"
                  autoComplete="current-password"
                  value={account.password}
                  onChange={handleTextChange}
                />
              </Grid>
              <Grid item xs="auto">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={account.mailing}
                      onChange={handleBooleanChange}
                      name="mailing"
                      color="primary"
                    />
                  }
                  label="Получать оповещения на почту"
                />
              </Grid>
            </Grid>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              disabled={loading}
              onClick={handleSubmit}
            >
              Зарегистрироваться
              {loading &&
              <CircularProgress size={15} className={classes.circularProgress} />}
            </Button>
            <Grid container justify="flex-end">
              <Grid item>
                <Link className={classes.link} component={RouterLink} to="/sign-in">
                  Уже есть учётная запись? Войдите с её помощью
                </Link>
              </Grid>
            </Grid>
          </Typography>
        </Typography>
      </Container>
    </Zoom>
  );
};

export default memo<IProps>(SignUpPage);
