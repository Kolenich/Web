import { Theme } from '@material-ui/core';
import { createStyles, StyleRules } from '@material-ui/styles';

export const styles = (theme: Theme): StyleRules => createStyles<string, {}>({
  itemSelected: {
    backgroundColor: theme.palette.grey.A100,
  },
});