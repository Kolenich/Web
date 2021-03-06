import { TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { ISelectElement } from 'lib/types';
import React, { ChangeEvent, FC } from 'react';
import styles from './styles';
import { IProps } from './types';

const useStyles = makeStyles(styles);

/**
 * Компонент фильтрации текстовых значений
 * @param {(newValue: any) => void} onValueChange функция, обрабатывающая изменение в поле
 * @param {string} value значение в поле
 * @returns {JSX.Element}
 * @constructor
 */
const TextEditor: FC<IProps> = ({ onValueChange, value = '' }) => {
  const classes = useStyles();

  return (
    <TextField
      label="Фильтр..."
      value={value}
      onChange={(event: ChangeEvent<ISelectElement>) => onValueChange(event.target.value)}
      fullWidth
      className={classes.textField}
    />
  );
};

export default TextEditor;
