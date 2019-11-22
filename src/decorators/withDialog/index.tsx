import { Dialog } from 'generic';
import { IDialogProps, IDialogStatus } from 'generic/Dialog/types';
import React, { ComponentType, useState } from 'react';
import { INotifications } from './types';

/**
 * Декоратор, подмешивающий компоненту диалоговое окно с функцией для его вызова
 * @param {React.ComponentType<T>} Component оборачиваемый компонент
 * @returns {React.FC<T>} компонент с подмшаным диалоговым окном и функцией вызова
 */
const withDialog = <T extends INotifications>(Component: ComponentType<T>) => (props: T) => {
  // Переменные состояния для диалогового окна
  const [dialog, setDialog] = useState<IDialogProps>({
    open: false,
    status: 'loading',
    message: '',
    warningAcceptCallback: undefined,
  });

  /**
   * Функция, закрывающая диалог
   */
  const closeDialog = () => (
    setDialog((oldDialog: IDialogProps) => ({ ...oldDialog, open: false }))
  );

  /**
   * Функция вызова диалогового окна
   * @param {string} message сообщение
   * @param {IDialogStatus} status статус вызываемого окна
   * @param {() => void} warningAcceptCallback функция-колбэк для принятия предупреждения
   */
  const openDialog = (
    message: string,
    status: IDialogStatus = 'success',
    warningAcceptCallback?: () => void,
  ) => (
    setDialog(() => ({ message, status, warningAcceptCallback, open: true }))
  );

  return (
    <>
      <Dialog {...dialog} onClose={closeDialog} />
      <Component {...props} openDialog={openDialog} />
    </>
  );

};

export default withDialog;
