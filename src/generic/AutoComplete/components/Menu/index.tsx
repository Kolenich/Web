import { Paper } from '@material-ui/core';
import React, { FC, memo } from 'react';
import { IProps } from './types';

/**
 * Компонент меню селекта
 * @param {Props<ISelectItem>} selectProps пропсы селекта
 * @param {object} innerProps внутренние пропсы
 * @param {React.ReactElement<any, string | React.JSXElementConstructor<any>>} children дочерние
 * компоненты
 * @returns {JSX.Element}
 * @constructor
 */
const Menu: FC<IProps> = ({ selectProps, innerProps, children }: IProps) => (
  <Paper square className={selectProps.classes.paper} {...innerProps}>
    {children}
  </Paper>
);

export default memo(Menu);