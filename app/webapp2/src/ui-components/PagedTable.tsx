import { Box, BoxExtendedProps, Spinner } from 'grommet';
import { FormNext, FormPrevious } from 'grommet-icons';
import { ReactNode, useCallback } from 'react';

import { useThemeContext } from './ThemedApp';
import { Page } from './types';

export interface IPageNumber extends BoxExtendedProps {
  number: number;
  selected?: boolean;
}

export const PageNumber = (props: IPageNumber): JSX.Element => {
  return (
    <Box
      {...props}
      style={{
        ...props.style,
        cursor: 'pointer',
        height: '32px',
        width: '32px',
        backgroundColor: '#D9D9D9',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: props.selected ? 'bold' : 'normal',
        userSelect: 'none',
      }}
      align="center"
      justify="center">
      {props.number}
    </Box>
  );
};

export interface TableColumn {
  title: string | React.ReactNode;
  width?: string;
  show?: boolean;
  align?: 'start' | 'end' | 'center';
}

export interface PagedTableI extends BoxExtendedProps {
  loading?: boolean;
  perPage?: number;
  page?: Page;
  columns?: TableColumn[];
  rows?: (row: number, column: number) => React.ReactElement;
  updatePage?: (page: Page) => void;
  invert?: boolean;
  loadingMsg?: ReactNode;
}

export const PagedTable = (props: PagedTableI): JSX.Element => {
  const { constants } = useThemeContext();

  const page = props.page;
  const loading = props.loading !== undefined ? props.loading : false;
  const loadingMsg =
    props.loadingMsg !== undefined ? props.loadingMsg : 'Loading';

  const nextPage = useCallback(() => {
    if (page && props.updatePage) {
      const hasNext =
        page.totalPages !== undefined && page.number < page.totalPages - 1;
      if (hasNext) {
        props.updatePage({ ...page, number: page.number + 1 });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, props.updatePage]);

  const prevPage = useCallback(() => {
    if (page && props.updatePage) {
      const hasPrev = page.totalPages !== undefined && page.number > 0;
      if (hasPrev) {
        props.updatePage({ ...page, number: page.number - 1 });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, props.updatePage]);

  const setPage = useCallback(
    (number: number) => {
      if (page && props.updatePage) {
        if (page.totalPages !== undefined && number <= page.totalPages) {
          props.updatePage({ ...page, number });
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [page]
  );

  const invert = props.invert !== undefined ? props.invert : false;
  const rowColor = invert
    ? constants.colors.backgroundLight
    : constants.colors.backgroundLight;
  const backgroundColor = invert
    ? constants.colors.backgroundLight
    : constants.colors.backgroundLight;

  const perPage = page ? page.perPage : props.perPage;

  return (
    <Box
      style={{
        width: '100%',
        userSelect: 'none',
        padding: '24px 16px',
        border: '1px solid',
        borderColor: constants.colors.primaryLight,
        borderRadius: '8px',
        backgroundColor: backgroundColor,
        ...props.style,
      }}>
      <Box
        direction="row"
        style={{
          width: '100%',
          textTransform: 'uppercase',
          fontSize: '12px',
          fontWeight: '700',
          marginBottom: '26px',
          padding: '0px 24px',
          color: constants.colors.primaryLight,
        }}>
        {!props.loading && props.columns ? (
          props.columns.map((column, colIx) => {
            const show = column.show === undefined ? true : column.show;
            return show ? (
              <Box
                key={colIx}
                direction="row"
                justify={column.align || 'center'}
                style={{
                  width: column.width,
                  textAlign: column.align ? column.align : 'center',
                }}>
                {column.title}
              </Box>
            ) : (
              <></>
            );
          })
        ) : (
          <></>
        )}
      </Box>
      <Box direction="column" style={{ width: '100%', position: 'relative' }}>
        {Array.from(Array(perPage).keys()).map((rowIx) => {
          return (
            <Box
              key={rowIx}
              fill
              direction="row"
              align="center"
              style={{
                border: '1px solid',
                borderColor: constants.colors.primaryLight,
                borderRadius: '20px',
                minHeight: '40px',
                marginBottom: '16px',
                padding: '10px 16px',
                backgroundColor: rowColor,
              }}>
              {!props.loading && props.columns ? (
                // eslint-disable-next-line array-callback-return
                Array.from(Array(props.columns.length).keys()).map((colIx) => {
                  if (props.columns) {
                    const column = props.columns[colIx];
                    if (column === undefined) {
                      return <></>;
                    }
                    const show = column.show === undefined ? true : column.show; // Repeated code as above. Changes need to be done in both places
                    return show ? (
                      <Box
                        key={`${rowIx}-${colIx}`}
                        direction="row"
                        justify={column.align || 'center'}
                        style={{
                          width: props.columns[colIx].width,
                          userSelect: 'text',
                          overflow: 'hidden',
                        }}>
                        {props.rows ? props.rows(rowIx, colIx) : <></>}
                      </Box>
                    ) : (
                      <></>
                    );
                  }
                })
              ) : (
                <></>
              )}
            </Box>
          );
        })}
        {loading ? (
          <Box
            fill
            justify="center"
            align="center"
            style={{
              position: 'absolute',
              borderRadius: '20px',
              backgroundColor: constants.colors.primaryLight,
              textAlign: 'center',
            }}>
            <Spinner></Spinner>
            {loadingMsg}
          </Box>
        ) : (
          <></>
        )}
      </Box>

      <Box
        direction="row"
        justify="center"
        align="center"
        style={{ height: '60px' }}>
        {page && page.totalPages && page.totalPages > 1 ? (
          <>
            <Box
              style={{ marginRight: '12px', cursor: 'pointer' }}
              onClick={() => prevPage()}>
              <FormPrevious></FormPrevious>
            </Box>

            {Array.from(Array(page.totalPages).keys()).map((ix) => {
              return (
                <PageNumber
                  onClick={() => setPage(ix)}
                  style={{ marginRight: '8px' }}
                  key={ix}
                  number={ix + 1}
                  selected={page.number === ix}></PageNumber>
              );
            })}
            <Box
              style={{ marginLeft: '12px', cursor: 'pointer' }}
              onClick={() => nextPage()}>
              <FormNext></FormNext>
            </Box>
          </>
        ) : (
          <></>
        )}
      </Box>
    </Box>
  );
};
