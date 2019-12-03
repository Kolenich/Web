import { INotifications } from 'decorators/withDialog/types';
import { ReactText } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { IAttachment } from '../../lib/types';

export interface IProps extends RouteComponentProps, INotifications {
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
  /** Объект вложения */
  attachment: IAttachment | null;
}
