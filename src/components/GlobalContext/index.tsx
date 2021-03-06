import React, { createContext, FC, useCallback, useMemo, useReducer } from 'react';
import initialState from './initialState';
import GlobalReducer from './reducer';
import { IGlobalState } from './types';

// Глобальное хранилище (контекст)
export const Context = createContext(initialState as IGlobalState);

/**
 * Компонент провайдера для контекста
 * @param {React.ReactNode} children дочерний компонент, который получит данные из контекста
 * @returns {JSX.Element}
 * @constructor
 */
const ContextProvider: FC = ({ children }) => {
  const [state, dispatch] = useReducer(GlobalReducer, initialState as IGlobalState);

  /**
   * Функция для обновления заголовка панели
   * @param {string} title - новый заголовок
   */
  const updateDashBoardTitle = useCallback(
    (title: string) => dispatch({
      type: 'SET_DASHBOARD_TITLE',
      payload: title,
    }),
    [],
  );

  const value: IGlobalState = useMemo(
    () => ({
      ...state,
      setters: {
        updateDashBoardTitle,
      },
    }),
    [state, updateDashBoardTitle],
  );

  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
};

export default ContextProvider;
