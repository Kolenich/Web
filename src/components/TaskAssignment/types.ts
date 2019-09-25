import { ReactText } from 'react';
import { RouteComponentProps } from 'react-router-dom';

export interface IProps extends RouteComponentProps {
}

export interface ITask {
  /** Краткое описание */
  summary: string;
  /** Полное описание */
  description: string;
  /** Кому назначено */
  assigned_to: ReactText;
  /** Срок исполнения */
  dead_line: string | null | Date;
  /** Комментарий */
  comment: string;
}
