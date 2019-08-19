import {
  Avatar,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  CssBaseline,
  FormControlLabel,
  Link,
  TextField,
  Typography,
} from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import { LockOutlined } from '@material-ui/icons';
import { withStyles } from '@material-ui/styles';
import { AxiosError, AxiosResponse } from 'axios';
import withContext from 'lib/context';
import { session } from 'lib/session';
import React, { ChangeEvent, PureComponent, ReactNode } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { Link as RouterLink } from 'react-router-dom';
import { styles } from './styles';
import './styles.css';
import { IProps, IState } from './types';

/**
 * Компонента страницы входа в систему
 */
class SignInPage extends PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    document.title = 'Войти в систему';
    this.state = {
      email: '',
      password: '',
      loading: false,
      remember: false,
      error: false,
    };
  }

  /**
   * Метод, обрабатывающий изменение в текстовом поле
   * @param event объект события изменения
   */
  handleTextChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  }

  /**
   * Метод, обрабатывающий изменение в чекбоксе
   * @param event объект события изменения
   */
  handleBooleanChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { name, checked } = event.target;
    this.setState({ [name]: checked });
  }

  /**
   * Метод для обработки нажатия на кнопку "Войти"
   */
  handleLogin = (): void => {
    this.setState({ loading: true });
    const { email, password } = this.state;
    session.post('auth/login/', { email, password })
      .then((response: AxiosResponse) => {
        this.setState({ loading: false });
        console.log(response);
      })
      .catch((error: AxiosError) => {
        this.setState({ loading: false });
        // Проверка для TypeScript
        if (error.response) {
          if (error.response.status === 400) {
            this.setState({ error: true });
            // Убираем сообщение об ошибке через 3 секунды
            setTimeout(() => this.setState({ error: false }), 3000);
          }
        }
      });
  }

  /**
   * Базовый метод рендера
   */
  public render(): ReactNode {
    const { classes } = this.props;
    const { email, password, loading, remember, error } = this.state;
    return (
      <ReactCSSTransitionGroup
        transitionName="sign-in"
        transitionAppear
        transitionAppearTimeout={500}
        transitionEnter={false}
        transitionLeave={false}
      >
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <Typography component="div" className={classes.paper}>
            <Avatar className={classes.avatar}>
              <LockOutlined />
            </Avatar>
            <Typography component="h1" variant="h5">
              Войти
            </Typography>
            <Typography component="form" className={classes.form}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="email"
                label="Электронная почта"
                name="email"
                error={error}
                autoComplete="email"
                value={email}
                onChange={this.handleTextChange}
              />
              <TextField
                variant="outlined"
                margin="normal"
                required
                error={error}
                fullWidth
                name="password"
                label="Пароль"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={this.handleTextChange}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    value={remember}
                    name="remember"
                    onChange={this.handleBooleanChange}
                    color="primary"
                  />
                }
                label="Запомнить"
              />
              <Button
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                onClick={this.handleLogin}
                disabled={loading}
              >
                Войти
                {loading &&
                <CircularProgress size={15} className={classes.circularProgress} />}
              </Button>
              <ReactCSSTransitionGroup
                transitionName="error"
                transitionAppear={false}
                transitionEnterTimeout={250}
                transitionLeaveTimeout={250}
                transitionEnter
                transitionLeave
              >
                {error &&
                <Typography className={classes.errorMessage}>
                  Неверный логин или пароль
                </Typography>}
              </ReactCSSTransitionGroup>
              <Grid container>
                <Grid item xs>
                  <Link variant="body2" component={RouterLink} to="/employees">
                    Забыли пароль?
                  </Link>
                </Grid>
                <Grid item>
                  <Link variant="body2" component={RouterLink} to="/sign-up">
                    Нет учётной записи? Зарегистрируйтесь!
                  </Link>
                </Grid>
              </Grid>
            </Typography>
          </Typography>
        </Container>
      </ReactCSSTransitionGroup>
    );
  }
}

export default withStyles(styles)(withContext<IProps>(SignInPage));
