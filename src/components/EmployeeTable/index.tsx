import {
  CustomPaging,
  DataTypeProvider,
  Filter,
  FilteringState,
  PagingState,
  Sorting,
  SortingState,
} from '@devexpress/dx-react-grid';
import {
  DragDropProvider,
  Grid,
  PagingPanel,
  TableColumnReordering,
  TableColumnResizing,
  TableFilterRow,
  TableHeaderRow,
  VirtualTable,
} from '@devexpress/dx-react-grid-material-ui';
import { LinearProgress, Paper } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { AxiosResponse } from 'axios';
import React, { ComponentState, PureComponent, ReactNode } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import api from '../../lib/api';
import Snackbar from '../../lib/generic/Snackbar';
import {
  filterRowMessages,
  pagingPanelMessages,
  tableHeaderRowMessage,
  tableMessages,
} from '../../lib/translate';
import { IApiResponse, IDRFGetConfig, ITableRow } from '../../lib/types';
import { filteringParams, sortingParams } from '../../lib/utils';
import EmployeeForm from '../EmployeeForm';
import columnSettings from './columnSettings';
import AddButton from './components/AddButton';
import NoFilterEditor from './components/EditorComponents/NoFilterEditor';
import IconTypeProvider from './components/FormatterComponents/IconFormatter';
import RootComponent from './components/RootComponent';
import customDataTypes from './customDataTypes';
import { styles } from './styles';
import './styles.css';
import { ICustomDataTypeProviderProps, IProps, IState } from './types';

/**
 * Компонент таблицы Сотрудников
 */
class EmployeeTable extends PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    document.title = 'Сотрудники';
    this.state = {
      ...columnSettings,
      rows: [],
      filters: [],
      sorting: [],
      pageSizes: [5, 10, 20],
      pageSize: 5,
      totalCount: 0,
      currentPage: 0,
      rowId: -1,
      addEmployee: false,
      loading: false,
      snackbarOpen: false,
      snackbarVariant: 'info',
      snackbarMessage: '',
    };
  }

  /**
   * Метод, вызываемый после монтирования компонента
   */
  public componentDidMount(): ComponentState {
    this.loadData();
  }

  /**
   * Метод, вызываемый после обновления компонента
   * @param prevProps предыдущие пропсы
   * @param prevState предыдущее состояние
   */
  public componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>):
    ComponentState {
    const { pageSize, currentPage, filters, sorting } = this.state;
    if (
      prevState.currentPage !== currentPage ||
      prevState.pageSize !== pageSize ||
      prevState.filters !== filters ||
      prevState.sorting !== sorting
    ) {
      this.loadData();
    }
  }

  /**
   * Метод для загрузи данных в таблицу с сервера
   */
  private loadData = (): ComponentState => {
    const { currentPage, pageSize, filters, sorting } = this.state;
    const config: IDRFGetConfig = {
      params: {
        // Параметры для пагинации
        limit: pageSize,
        offset: currentPage * pageSize,
      },
    };
    // Параметры для фильтрации
    filters.map((filter: Filter): void => {
      if (filter.operation) {
        config.params[filter.columnName + filteringParams[filter.operation]] = filter.value;
      }
      return undefined;
    });
    // Параметры для сортировки
    sorting.map((sort: Sorting): void => {
      config.params.ordering = sortingParams[sort.direction] + sort.columnName;
      return undefined;
    });
    api.getContent<IApiResponse<ITableRow>>('employee-table', config)
      .then((response: AxiosResponse<IApiResponse<ITableRow>>): ComponentState => {
        const { results, count } = response.data;
        this.setState((state: IState) => (
          { ...state, rows: results, totalCount: count, loading: false }
        ));
      })
      .catch(() => {
        this.setState((state: IState) => ({
          ...state,
          loading: false,
          snackbarOpen: true,
          snackbarVariant: 'error',
          snackbarMessage: 'При загрузке данных произошла ошибка',
        }));
      });
  }

  /**
   * Колбэк-метод, открывающий модальное окно
   * @param rowId id сотрудника
   */
  private openEditWindow = (rowId: number) => (): ComponentState => (
    this.setState((state: IState) => ({ ...state, rowId, addEmployee: true }))
  )

  /**
   * Колбэк-метод, закрывающий модальное окно
   */
  private closeEditWindow = (): ComponentState => (
    this.setState((state: IState) => ({ ...state, rowId: -1, addEmployee: false }))
  )

  /**
   * Метод для обработки изменения числа строк на странице
   * @param pageSize
   */
  private changePageSize = (pageSize: number): ComponentState => (
    this.setState((state: IState) => ({ ...state, pageSize, loading: true, currentPage: 0 }))
  )

  /**
   * Функция обработки изменения текущей страницы
   * @param currentPage номер текущей страницы
   */
  private changeCurrentPage = (currentPage: number): ComponentState => (
    this.setState((state: IState) => ({ ...state, currentPage, loading: true }))
  )

  /**
   * Функция изменения фильтров
   * @param filters массив фильтров
   */
  private changeFilters = (filters: Filter[]): ComponentState => (
    this.setState((state: IState) => ({ ...state, filters, loading: true }))
  )

  /**
   * Фугкция изменения сортировок
   * @param sorting массив сортировок
   */
  private changeSorting = (sorting: Sorting[]): ComponentState => (
    this.setState((state: IState) => ({ ...state, sorting, loading: true }))
  )

  /**
   * Функция получения уникального идентификатора строки
   * @param row строка
   */
  private getRowId = (row: ITableRow) => row.id;

  /**
   * Функция, закрывающая снэкбар
   */
  private closeSnackbar = (): ComponentState => (
    this.setState((state: IState) => ({ ...state, snackbarOpen: false }))
  )

  /**
   * Базовый метод рендера
   */
  public render(): ReactNode {
    const { classes } = this.props;
    const {
      rows, columns, defaultOrder, defaultColumnWidths, pageSizes, pageSize, addEmployee, rowId,
      loading, totalCount, currentPage, sortingStateColumnExtensions, sorting, buttonColumns,
      snackbarOpen, snackbarVariant, snackbarMessage,
    } = this.state;
    return (
      <ReactCSSTransitionGroup
        transitionName="table"
        transitionAppear
        transitionAppearTimeout={500}
        transitionEnter={false}
        transitionLeave={false}
      >
        <Snackbar
          open={snackbarOpen}
          variant={snackbarVariant}
          message={snackbarMessage}
          onClose={this.closeSnackbar}
        />
        <Paper
          className={classes.paper}
        >
          <Grid
            rows={rows}
            columns={columns}
            getRowId={this.getRowId}
            rootComponent={RootComponent}
          >
            {customDataTypes.map((props: ICustomDataTypeProviderProps) => (
              <DataTypeProvider {...props} />
            ))}
            <IconTypeProvider
              handleClick={this.openEditWindow}
              for={buttonColumns}
              availableFilterOperations={[]}
              editorComponent={NoFilterEditor}
            />
            <DragDropProvider />
            <SortingState
              sorting={sorting}
              onSortingChange={this.changeSorting}
              columnExtensions={sortingStateColumnExtensions}
            />
            <PagingState
              currentPage={currentPage}
              pageSize={pageSize}
              onPageSizeChange={this.changePageSize}
              onCurrentPageChange={this.changeCurrentPage}
            />
            <CustomPaging
              totalCount={totalCount}
            />
            <FilteringState
              onFiltersChange={this.changeFilters}
            />
            <VirtualTable
              height="auto"
              messages={tableMessages}
            />
            <TableColumnReordering
              defaultOrder={defaultOrder}
            />
            <TableColumnResizing
              defaultColumnWidths={defaultColumnWidths}
            />
            <TableHeaderRow
              showSortingControls
              messages={tableHeaderRowMessage}
            />
            <TableFilterRow
              showFilterSelector
              messages={filterRowMessages}
            />
            <PagingPanel
              pageSizes={pageSizes}
              messages={pagingPanelMessages}
            />
          </Grid>
          {loading && <LinearProgress />}
        </Paper>
        <AddButton
          tooltip="Создать"
          onClick={this.openEditWindow(-1)}
        />
        <EmployeeForm
          id={rowId}
          open={addEmployee}
          onClose={this.closeEditWindow}
          updateTable={this.loadData}
        />
      </ReactCSSTransitionGroup>
    );
  }
}

export default withStyles(styles)(EmployeeTable);
