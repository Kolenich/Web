import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import 'filepond/dist/filepond.min.css';
import { session, source } from 'lib/session';
import { toBase64, useUpdateEffect } from 'lib/utils';
import React, { FC, memo, useState } from 'react';
import { File, FilePond } from 'react-filepond';
import styles from './styles';
import { IBase64File, IProps, ProcessServerConfigFunction } from './types';

const useStyles = makeStyles(styles);

/**
 * Компонент-загрузчик файлов
 * @param multiple {boolean} указатель на множественность загрузки файлов
 * @param maxFiles {number} максимальное количество файлов (если стоит флаг multiple)
 * @param hint {string} текстовая подсказка над загрузчиком
 * @param uploaderText {string} текст для отображения на самом загрузчике
 * @param onFilesUpdate {(files: (File|IBase64File)[]) => void} колбэк для передачи массива с
 * файлами родителю
 * @param base64 {boolean} флаг, определяющий перекодировку файлов в base64
 * @param uploadTo {string} адрес для отправки файла
 * @param instantUpload {boolean} указатель мгновенной загрузки файла
 * @param uploadCallback {IUploadCallback} функция, принимающая данные с сервера при успешной
 * загрузке
 * @param field {string} имя поля для упрощения получения доступа  кфайлу в БД
 * @param onUploadError {IUploadCallback} функция, принимающая данные с сервера при неуспешной
 * загрузке
 * @returns {JSX.Element}
 * @constructor
 */
const FileUploader: FC<IProps> =
  ({
     multiple,
     maxFiles,
     hint,
     uploaderText,
     onFilesUpdate,
     base64,
     uploadTo,
     instantUpload,
     uploadCallback,
     field,
     onUploadError,
   }: IProps) => {
    const classes = useStyles();

    const [files, setFiles] = useState<(File | IBase64File)[]>([]);

    /**
     * Функция обработки обновления файлов в дроп-зоне
     * @param newFiles {File[]} обновленной массив файлов
     */
    const onUpdateFiles = async (newFiles: File[]) => {
      // Если передан флаг base64, перекодируем файлы в base64
      if (base64) {
        const base64Files: IBase64File[] = await Promise.all(newFiles.map(async (file: File) => {
          const { filename, fileType, fileSize } = file;
          // Перекодируем в base64
          const base64File = await toBase64(file.file);
          return { filename, fileType, fileSize, file: base64File.split(';base64,')[1] };
        }));
        setFiles(() => [...base64Files]);
      } else {
        setFiles(() => [...newFiles]);
      }
    };

    /**
     * Эффект для передачи файлов через колбэк родителю
     */
    const flowToParent = () => {
      if (onFilesUpdate) {
        onFilesUpdate(files);
      }
    };

    const process: ProcessServerConfigFunction =
      async (fieldName,
             file,
             metadata,
             load,
             error,
             progress,
             abort,
      ) => {
        // Настройка обработчика процесса отправки
        session.defaults.onUploadProgress = event => (
          progress(event.lengthComputable, event.loaded, event.total)
        );
        session.defaults.headers['Content-Type'] = 'multipart/form-data';
        // Формируем тело запроса
        const formData = new FormData();
        formData.append(fieldName, file, file.name);
        if (field) {
          formData.append('field', field);
        }
        // Отправляем запрос
        try {
          const { data } = await session.post(uploadTo!, formData);
          load(data);
          if (uploadCallback) {
            uploadCallback(data);
          }
        } catch (err) {
          error(err);
          if (onUploadError && err.response) {
            onUploadError(err.response.data);
          }
        }
        // Возвращаем настройки сессии в исходное положение
        session.defaults.onUploadProgress = undefined;
        session.defaults.headers['Content-Type'] = 'application/json';
        // Возвращаем метод для остановки запроса
        return {
          abort: () => {
            // Функция вызывается в случае, если нажата отмена запроса
            source.cancel();
            // Посылаем сигнал компоненту, что запрос остановлен
            abort();
          },
        };
      };

    useUpdateEffect(flowToParent, [files]);

    return (
      <>
        <Typography className={classes.hint}>
          {hint}
        </Typography>
        <FilePond
          instantUpload={instantUpload}
          server={{ process }}
          labelIdle={uploaderText}
          allowMultiple={multiple}
          maxFiles={maxFiles}
          onupdatefiles={onUpdateFiles}
          labelFileProcessing="Подождите, файл загружается..."
          labelFileProcessingError="Не удалось загрузить файл"
          labelFileProcessingComplete="Загрузка завершена"
          labelTapToCancel="Нажмите, чтобы отменить"
          labelTapToRetry="Нажмите, чтобы попробовать снова"
          labelFileProcessingAborted="Загрузка файла прервана"
        />
      </>
    );
  };

FileUploader.defaultProps = {
  uploaderText: `Перетяните сюда файл или <span class="filepond--label-action">нажмите</span>, чтобы выбрать`,
  instantUpload: false,
  maxFiles: 1,
};

export default memo(FileUploader);