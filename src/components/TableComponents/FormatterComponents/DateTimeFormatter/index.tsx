import { Typography } from '@material-ui/core';
import { DATETIME_OPTIONS } from 'lib/constants';
import React, { FC } from 'react';
import { IProps } from './types';

/**
 * Форматтер для даты без времени
 * @param {any} value значение
 * @returns {JSX.Element}
 * @constructor
 */
const DateTimeFormatter: FC<IProps> = ({ value }) => (
  <Typography component="div">
    {value
      ? new Date(value).toLocaleDateString('ru', DATETIME_OPTIONS)
      : 'Не указана'}
  </Typography>
);

export default DateTimeFormatter;
