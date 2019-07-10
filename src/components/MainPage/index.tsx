import { withStyles } from '@material-ui/core';
import React, { PureComponent, ReactNode } from 'react';
import { Redirect, Route, Switch } from 'react-router';
import EmployeeChart from '../EmployeeChart';
import EmployeeTable from '../EmployeeTable';
import SignInPage from '../SignInPage';
import SignUpPage from '../SignUpPage';
import { styles } from './styles';
import { IProps, IState } from './types';

/**
 * Компонент основной страницы
 */
class MainPage extends PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      loggedIn: false,
    };
  }

  /**
   * Базовый метод рендера
   */
  public render(): ReactNode {
    const { loggedIn } = this.state;
    return (
      <Switch>
        <Route path="/sign-in" component={SignInPage} />
        <Route path="/sign-up" component={SignUpPage} />
        <Route path="/employees" component={EmployeeTable} />
        <Route path="/charts" component={EmployeeChart} />
        {loggedIn &&
        <Redirect to="/employees" from="/" />}
        {!loggedIn &&
        <Redirect to="/sign-in" from="/" />}
      </Switch>
    );
  }
}

export default withStyles(styles)(MainPage);
