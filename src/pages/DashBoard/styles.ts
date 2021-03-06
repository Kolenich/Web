import { Theme } from '@material-ui/core';
import { createStyles } from '@material-ui/styles';

const drawerWidth = 200;

/**
 * Стили Material UI
 * @param {Theme} theme тема Material UI
 * @return {StyleRules<{}, string>} CSS-классы
 */
const styles = (theme: Theme) => createStyles({
  root: {
    flexGrow: 1,
    height: '100%',
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    width: '100%',
  },
  navIconHide: {
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  appBar: {
    position: 'absolute',
    marginLeft: drawerWidth,
    [theme.breakpoints.up('md')]: {
      width: `calc(100% - ${drawerWidth}px)`,
    },
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerRoot: {
    height: '100%',
  },
  appBarSpacer: { ...theme.mixins.toolbar },
  content: {
    flexGrow: 1,
    height: '100%',
    overflow: 'auto',
  },
  headerMenuButton: {
    marginLeft: theme.spacing(2),
    padding: theme.spacing(0.5),
  },
  headerMenu: {
    marginTop: theme.spacing(7),
    horizontal: 'right',
  },
  profileMenuUser: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2),
  },
  accountPageLink: {
    display: 'flex',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    cursor: 'pointer',
  },
  profileMenuLink: {
    fontSize: 16,
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    '&:hover': {
      cursor: 'pointer',
      color: theme.palette.primary.dark,
    },
  },
  rightIcon: {
    marginLeft: theme.spacing(1),
  },
});

export default styles;
