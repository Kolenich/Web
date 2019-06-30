import {
  CustomPaging,
  DataTypeProvider,
  DataTypeProviderProps,
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
  Table,
  TableColumnReordering,
  TableColumnResizing,
  TableFilterRow,
  TableHeaderRow,
} from '@devexpress/dx-react-grid-material-ui';
import {
  Avatar,
  Fab,
  FormControl,
  IconButton,
  Input,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { Add, Create } from '@material-ui/icons';
import { AxiosError, AxiosResponse } from 'axios';
import React, { ChangeEvent, ComponentState, PureComponent, ReactNode } from 'react';
import avatar from '../../assets/default_avatar.png';
import api from '../../lib/api';
import {
  filterRowMessages,
  pagingPanelMessages,
  tableHeaderRowMessage,
  tableMessages,
} from '../../lib/translate';
import { IApiResponse, IDRFGetConfig, ISelectElement, ITableRow, Sex } from '../../lib/types';
import {
  dateOptions,
  dateTimeOptions,
  filteringParams,
  getFileLoadURL,
  sortingParams,
} from '../../lib/utils';
import EmployeeForm from '../EmployeeForm';
import columnSettings from './columnSettings';
import { styles } from './styles';
import { IProps, IState } from './types';

const sexParams: string[] = ['Муж.', 'Жен.'];

/**
 * Форматтер для даты без времени
 * @param value значение
 * @constructor
 */
const DateFormatter = ({ value }: DataTypeProvider.ValueFormatterProps) => (
  <>{new Date(value).toLocaleDateString('ru', dateOptions)}</>
);

/**
 * Форматтер для изображений
 * @param value url файла
 * @constructor
 */
const ImageFormatter = ({ value }: DataTypeProvider.ValueFormatterProps) => {
  if (value !== null) {
    return (
      <Avatar src={`${getFileLoadURL()}${value}`} />
    );
  }
  return <Avatar src={avatar} />;
};

/**
 * Форматтер для даты с временем
 * @param value значение
 * @constructor
 */
const DateTimeFormatter = ({ value }: DataTypeProvider.ValueFormatterProps) => (
  <>{new Date(value).toLocaleDateString('ru', dateTimeOptions)}</>
);

/**
 * Тип данных для ячеек даты без времени
 * @param props свойства ячейки
 * @constructor
 */
const DateTypeProvider = (props: DataTypeProviderProps) => (
  <DataTypeProvider {...props} formatterComponent={DateFormatter} />
);

/**
 * Тип данных для ячеек с аватарами
 * @param props свойства ячейки
 * @constructor
 */
const ImageTypeProvider = (props: DataTypeProviderProps) => (
  <DataTypeProvider {...props} formatterComponent={ImageFormatter} />
);

/**
 * Тип данных для ячеек даты с временем
 * @param props свойства ячейки
 * @constructor
 */
const DateTimeTypeProvider = (props: DataTypeProviderProps) => (
  <DataTypeProvider {...props} formatterComponent={DateTimeFormatter} />
);

/**
 * Компонент таблицы Сотрудников
 */
class EmployeeTable extends PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      ...columnSettings,
      sex: '',
      rows: [],
      filters: [],
      sorting: [],
      pageSizes: [2, 5, 10, 20],
      pageSize: 5,
      totalCount: 0,
      currentPage: 0,
      rowId: -1,
      addEmployee: false,
      loading: false,
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
   * Компонент для иконок под разные статусы
   */
  IconFormatter = (props: DataTypeProvider.ValueFormatterProps) => {
    const { id } = props.row;
    return (
      <Tooltip title="Редактировать">
        <IconButton onClick={this.openEditWindow(id)}>
          <Create />
        </IconButton>
      </Tooltip>
    );
  }

  /**
   * Компонент, предоставляющий тип для иконок под разные статусы
   */
  IconTypeProvider = (props: DataTypeProviderProps) => (
    <DataTypeProvider
      formatterComponent={this.IconFormatter}
      {...props}
    />
  )

  /**
   * КОмпонент ячейуи для фильтрации по столбцам
   * @param props базовые пропсы
   */
  filterCellComponent = (props: TableFilterRow.CellProps) => {
    const { classes } = this.props;
    const { sex } = this.state;
    const { column, onFilter } = props;
    if (column.name !== 'sex') {
      if (column.name === 'button' || column.name === 'avatar') {
        return (
          <TableFilterRow.Cell {...props} >
            <Typography component="div" />
          </TableFilterRow.Cell>
        );
      }
      return (
        <TableFilterRow.Cell {...props} />
      );
    }
    return (
      <TableFilterRow.Cell{...props}>
        <FormControl fullWidth>
          <InputLabel>Фильтр...</InputLabel>
          <Select
            className={classes.sexSelect}
            value={sex}
            input={<Input />}
            onChange={
              (event: ChangeEvent<ISelectElement>) => {
                let value: string = '';
                const columnName: string = column.name;
                const operation: string = 'equal';
                if (event.target.value === 'Муж.') {
                  value = 'male';
                }
                if (event.target.value === 'Жен.') {
                  value = 'female';
                }
                const filter: Filter = { value, columnName, operation };
                onFilter(filter);
                this.setState({ sex: event.target.value as Sex });
              }
            }
          >
            <MenuItem value=""><em>Сброс</em></MenuItem>
            {sexParams.map((value: string) => (
              <MenuItem key={value} value={value}>{value}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </TableFilterRow.Cell>
    );
  }

  /**
   * Метод для загрузи данных в таблицу с сервера
   */
  private loadData = (): ComponentState => {
    const { currentPage, pageSize, filters, sorting } = this.state;
    console.log(filters);
    const config: IDRFGetConfig = {
      params: {
        // Параметры для пагинации
        limit: pageSize,
        offset: currentPage * pageSize,
      },
    };
    // Параметры для фильтрации
    // eslint-disable-next-line
    filters.map((filter: Filter): void => {
      if (filter.operation) {
        config.params[`${filter.columnName}${filteringParams[filter.operation]}`] = filter.value;
      }
    });
    // Параметры для сортировки
    // eslint-disable-next-line
    sorting.map((sort: Sorting) => {
      config.params.ordering = `${sortingParams[sort.direction]}${sort.columnName}`;
    });
    api.getContent<IApiResponse<ITableRow>>('employees-table', config)
      .then((response: AxiosResponse<IApiResponse<ITableRow>>): ComponentState => {
        const { results, count } = response.data;
        this.setState({ rows: results, totalCount: count, loading: false });
      })
      .catch((error: AxiosError) => {
        console.log(error);
      });
  }

  /**
   * Кнопка для добавления нового сотрудника
   * @constructor
   */
  AddButton = (): JSX.Element => {
    const { classes } = this.props;
    return (
      <Tooltip title="Создать">
        <Fab color="primary" className={classes.addIcon} variant="extended"
             onClick={this.openEditWindow(-1)}>
          <Add />
          Создать
        </Fab>
      </Tooltip>
    );
  }

  /**
   * Компонент строки в таблице
   * @param props базовые пропсы
   * @constructor
   */
  rowComponent = (props: Table.DataRowProps): JSX.Element => {
    const { classes } = this.props;
    const rowId: number = props.row.id;
    return (
      <Table.Row
        {...props}
        className={classes.rowCursor}
        onDoubleClick={this.openEditWindow(rowId)}
      />);
  }

  /**
   * Колбэк-метод, открывающий модальное окно
   * @param rowId id сотрудника
   */
  private openEditWindow = (rowId: number) => (): ComponentState => {
    this.setState({ rowId, addEmployee: true });
  }

  /**
   * Колбэк-метод, закрывающий модальное окно
   */
  private closeEditWindow = (): ComponentState => {
    this.setState({ addEmployee: false, rowId: -1 });
  }

  /**
   * Метод для обработки изменения числа строк на странице
   * @param pageSize
   */
  private changePageSize = (pageSize: number): ComponentState => {
    this.setState({ pageSize, loading: true, currentPage: 0 });
  }

  /**
   * Функция обработки изменения текущей страницы
   * @param currentPage номер текущей страницы
   */
  private changeCurrentPage = (currentPage: number): ComponentState => {
    this.setState({ currentPage, loading: true });
  }

  /**
   * Фугкция изменения фильтров
   * @param filters массив фильтров
   */
  private changeFilters = (filters: Filter[]): ComponentState => {
    this.setState({ filters, loading: true });
  }

  /**
   * Фугкция изменения сортировок
   * @param sorting массив сортировок
   */
  private changeSorting = (sorting: Sorting[]): ComponentState => {
    this.setState({ sorting, loading: true });
  }

  /**
   * Базовый метод рендера
   */
  public render(): ReactNode {
    const { classes } = this.props;
    const {
      rows,
      columns,
      defaultOrder,
      defaultColumnWidths,
      pageSizes,
      pageSize,
      addEmployee,
      rowId,
      loading,
      totalCount,
      currentPage,
      filteringStateColumnExtensions,
      sortingStateColumnExtensions,
      sorting,
      dateColumns,
      dateTimeColumns,
      avatarColumns,
      buttonColumns,
      availableFilterOperations,
      filterableColumns,
    } = this.state;
    return (
      <Paper className={classes.paper}>
        <Grid rows={rows} columns={columns}>
          <DataTypeProvider
            for={filterableColumns}
            availableFilterOperations={availableFilterOperations}
          />
          <DateTypeProvider for={dateColumns} />
          <DateTimeTypeProvider for={dateTimeColumns} />
          <ImageTypeProvider for={avatarColumns} />
          <this.IconTypeProvider for={buttonColumns} />
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
            columnExtensions={filteringStateColumnExtensions}
          />
          <Table
            rowComponent={this.rowComponent}
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
            cellComponent={this.filterCellComponent}
          />
          <PagingPanel
            pageSizes={pageSizes}
            messages={pagingPanelMessages}
          />
        </Grid>
        <EmployeeForm
          id={rowId}
          open={addEmployee}
          onClose={this.closeEditWindow}
          updateTable={this.loadData}
        />
        <this.AddButton />
        {loading && <LinearProgress />}
      </Paper>
    );
  }
}

export default withStyles(styles)(EmployeeTable);
