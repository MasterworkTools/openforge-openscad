import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Alert, AlertTitle, SelectChangeEvent } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { MuiChipsInput } from 'mui-chips-input';
import React, { useMemo } from 'react';

import { Parameter } from '../../lib/openSCAD/parseParameter';
import parseOpenScadParameters from '../../lib/openSCAD/parseParameter';
import { useWorkspaceProvider } from '../providers/WorkspaceProvider';
import { useFileSystemProvider } from '../providers/FileSystemProvider';
import FileSelector from './FileSystem/FileSelector';
import { useOpenSCADProvider } from '../providers/OpenscadWorkerProvider';
import useDynamicImports from '../../hooks/useDynamicImports';

type Parameters = Parameter[];

type Props = {
  parameters: Parameters;
  onChange: (parameters: Parameters) => void;
};

// File import mapping - maps filenames to their required STL dependencies
const fileImportMap = {
  'bases-wall-primary.scad': [
    {name: 'stl: base: dungeon-stone A', url: '/scad/dungeon_stone.blank.A.stl'},
    {name: 'stl: base: dungeon-stone BA', url: '/scad/dungeon_stone.blank.BA.stl'},
    {name: 'stl: base: dungeon-stone D', url: '/scad/dungeon_stone.blank.D.stl'},
    {name: 'stl: base: dungeon-stone IA', url: '/scad/dungeon_stone.blank.IA.stl'},
    {name: 'stl: base: dungeon-stone Q', url: '/scad/dungeon_stone.blank.Q.stl'},
    {name: 'stl: base: cut-stone A', url: '/scad/cut-stone.blank.A.stl'},
    {name: 'stl: base: cut-stone BA', url: '/scad/cut-stone.blank.BA.stl'},
    {name: 'stl: base: cut-stone D', url: '/scad/cut-stone.blank.D.stl'},
    {name: 'stl: base: cut-stone IA', url: '/scad/cut-stone.blank.IA.stl'},
    {name: 'stl: base: cut-stone Q', url: '/scad/cut-stone.blank.Q.stl'},
    {name: 'stl: base: facade ground-level A', url: '/scad/facade.ground_level.blank.A.stl'},
    {name: 'stl: base: facade ground-level BA', url: '/scad/facade.ground_level.blank.BA.stl'},
    {name: 'stl: base: facade ground-level D', url: '/scad/facade.ground_level.blank.D.stl'},
    {name: 'stl: base: facade ground-level IA', url: '/scad/facade.ground_level.blank.IA.stl'},
    {name: 'stl: base: facade ground-level door A', url: '/scad/facade.ground_level.door.blank.A.stl'},
    {name: 'stl: base: facade ground-level door BA', url: '/scad/facade.ground_level.door.blank.BA.stl'},
    {name: 'stl: base: facade upper-level A', url: '/scad/facade.upper_level.blank.A.stl'},
    {name: 'stl: base: facade upper-level BA', url: '/scad/facade.upper_level.blank.BA.stl'},
    {name: 'stl: base: facade upper-level D', url: '/scad/facade.upper_level.blank.D.stl'},
    {name: 'stl: base: facade upper-level IA', url: '/scad/facade.upper_level.blank.IA.stl'},
    {name: 'stl: base: facade upper-level chimney A', url: '/scad/facade.upper_level.chimney.blank.A.stl'},
    {name: 'stl: base: facade upper-level chimney D', url: '/scad/facade.upper_level.chimney.blank.D.stl'},
    {name: 'stl: base: necromancer A', url: '/scad/necromancer.blank.A.stl'},
    {name: 'stl: base: necromancer BA', url: '/scad/necromancer.blank.BA.stl'},
    {name: 'stl: base: necromancer D', url: '/scad/necromancer.blank.D.stl'},
    {name: 'stl: base: necromancer IA', url: '/scad/necromancer.blank.IA.stl'},
    {name: 'stl: base: necromancer Q', url: '/scad/necromancer.blank.Q.stl'},
    {name: 'stl: base: rough-stone A', url: '/scad/rough_stone.blank.A.stl'},
    {name: 'stl: base: rough-stone BA', url: '/scad/rough_stone.blank.BA.stl'},
    {name: 'stl: base: rough-stone IA', url: '/scad/rough_stone.blank.IA.stl'},
    {name: 'stl: base: rough-stone D', url: '/scad/rough_stone.blank.D.stl'},
    {name: 'stl: base: rough-stone Q', url: '/scad/rough_stone.blank.Q.stl'},
    {name: 'stl: base: towne A', url: '/scad/towne.blank.A.stl'},
    {name: 'stl: base: towne BA', url: '/scad/towne.blank.BA.stl'},
    {name: 'stl: base: towne D', url: '/scad/towne.blank.D.stl'},
    {name: 'stl: base: towne IA', url: '/scad/towne.blank.IA.stl'},
    {name: 'stl: base: towne Q', url: '/scad/towne.blank.Q.stl'},
    {name: 'stl: base: aztlan A', url: '/scad/aztlan.blank.A.stl'},
    {name: 'stl: base: aztlan BA', url: '/scad/aztlan.blank.BA.stl'},
    {name: 'stl: base: aztlan D', url: '/scad/aztlan.blank.D.stl'},
    {name: 'stl: base: aztlan IA', url: '/scad/aztlan.blank.IA.stl'},
    {name: 'stl: base: aztlan Q', url: '/scad/aztlan.blank.Q.stl'},
    {name: 'stl: base: nova-trail A', url: '/scad/nova_trail.blank.A.stl'},
    {name: 'stl: base: nova-trail BA', url: '/scad/nova_trail.blank.BA.stl'},
    {name: 'stl: base: nova-trail D', url: '/scad/nova_trail.blank.D.stl'},
    {name: 'stl: base: nova-trail IA', url: '/scad/nova_trail.blank.IA.stl'},
    {name: 'stl: base: nova-trail Q', url: '/scad/nova_trail.blank.Q.stl'},
  ]
};

const validateNumber = (value) => {
  if (isNaN(Number(value))) {
    return { isError: true, textError: 'Input must be a number' };
  }
  return true;
};

const validateBoolean = (value) => {
  if (value !== 'true' && value !== 'false') {
    return {
      isError: true,
      textError: `Input must be a boolean (i.e. 'true' or 'false')`,
    };
  }
  return true;
};

export default function Customizer({ parameters, onChange }: Props) {
  const { setCode, selectedFile, setSelectedFile } = useWorkspaceProvider();
  const { files } = useFileSystemProvider();
  const { preview } = useOpenSCADProvider();
  const { importFiles, isLoading: isImporting, currentFile } = useDynamicImports();

  const changeParameter = (name: string, newValue?) => {
    const newParameters = parameters.map((parameter) => {
      if (parameter.name === name) {
        if (parameter.type === 'number') {
          newValue = Number(newValue);
        } else if (parameter.type === 'boolean') {
          newValue = Boolean(newValue);
        } else if (parameter.type === 'number[]') {
          newValue = newValue.map(Number);
        } else if (parameter.type === 'boolean[]') {
          newValue = newValue.map((v) => v === 'true');
        }

        return {
          ...parameter,
          value: newValue,
        };
      }
      return parameter;
    });
    onChange(newParameters);
  };

  const handleParameterChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    changeParameter(event.target.name, event.target.value);
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    changeParameter(event.target.name, event.target.checked);
  };

  const handleAutocompleteChange = (name) => (newValue?) => {
    changeParameter(name, newValue);
  };

  // Load the selected file.
  const handleFileSelect = (event: SelectChangeEvent<string>) => {
    const file = files.find((f) => f.path === event.target.value);

    if (file) {
      (async () => {
        // Check if this file has dependencies to load first
        const fileName = file.name;
        const dependencies = fileImportMap[fileName];
        
        if (dependencies) {
          console.log(`Loading dependencies for ${fileName}`);
          await importFiles(dependencies);
        }

        const text = await file.text();
        setCode(text);
        setSelectedFile(file.path);
        // parse parameters from new file and render
        const newParams = parseOpenScadParameters(text);
        preview(text, newParams);
      })();
    }
  };
  
  // Group parameters
  const groups = useMemo(
    () =>
      parameters.reduce((acc, parameter) => {
        if (parameter.group) {
          if (!acc[parameter.group]) {
            acc[parameter.group] = [];
          }
          acc[parameter.group].push(parameter);
        } else {
          acc[''] = acc[''] || [];
          acc[''].push(parameter);
        }
        return acc;
      }, {}) as { [key: string]: Parameters },
    [parameters]
  );

  return (
    <div style={{ height: '100%', overflow: 'scroll', position: 'relative' }}>
      {isImporting && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <CircularProgress size={40} />
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <div>Loading STL dependencies...</div>
            {currentFile && (
              <div style={{ fontSize: '0.9em', color: '#666', marginTop: 8 }}>
                {currentFile}
              </div>
            )}
          </div>
        </div>
      )}
      
      <Alert severity="info" sx={{ mb: 1 }}>
        <AlertTitle>Customizer</AlertTitle>
      </Alert>
      <FileSelector onChange={handleFileSelect} selectedFile={selectedFile} namePrefixes={["bases-", "risers_"]} />
      {Object.entries(groups)
        .filter((x) => x[0].toLowerCase() !== 'hidden')
        .map(([groupName, groupParams], idx) => (
          <Accordion defaultExpanded={idx === 0} key={idx}>
            <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
              {groupName || <i>Common Parameters</i>}
            </AccordionSummary>
            <AccordionDetails>
              {groupParams.map((parameter) => {
                if (
                  parameter.type === 'number' ||
                  parameter.type === 'string'
                ) {
                  if (parameter.options) {
                    return (
                      <TextField
                        select
                        label={parameter.description || parameter.name}
                        fullWidth
                        key={parameter.name}
                        name={parameter.name}
                        onChange={handleParameterChange}
                        value={parameter.value}
                        sx={{ mt: 2, p: 1 }}
                      >
                        {parameter.options.map((option, idx) => (
                          <MenuItem key={idx} value={option.value}>
                            {option.label || option.value}
                          </MenuItem>
                        ))}
                      </TextField>
                    );
                  }

                  return (
                    <TextField
                      label={parameter.description || parameter.name}
                      fullWidth
                      type={parameter.type}
                      key={parameter.name}
                      name={parameter.name}
                      onChange={handleParameterChange}
                      value={parameter.value}
                      InputProps={{
                        inputProps: {
                          maxLength: parameter.range?.max,
                          min: parameter.range?.min,
                          max: parameter.range?.max,
                          step: parameter.range?.step,
                        },
                      }}
                      sx={{ mt: 2, p: 1 }}
                    />
                  );
                } else if (parameter.type === 'boolean') {
                  return (
                    <FormGroup key={parameter.name}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            name={parameter.name}
                            onChange={handleCheckboxChange}
                            checked={parameter.value === true}
                          />
                        }
                        label={parameter.description || parameter.name}
                      />
                    </FormGroup>
                  );
                } else if (
                  parameter.type === 'number[]' ||
                  parameter.type === 'string[]' ||
                  parameter.type === 'boolean[]'
                ) {
                  const type = parameter.type.replace('[]', '');
                  let validate;

                  if (type === 'number') {
                    validate = validateNumber;
                  } else if (type === 'boolean') {
                    validate = validateBoolean;
                  }

                  return (
                    <MuiChipsInput
                      key={parameter.name}
                      fullWidth
                      label={parameter.description || parameter.name}
                      onChange={handleAutocompleteChange(parameter.name)}
                      renderChip={(Component, key, chipProps) => {
                        // Rendering the label with a boolean would lead to errors,
                        // hence the toString() call.
                        return (
                          <Component
                            key={key}
                            {...chipProps}
                            title={chipProps.title.toString()}
                            label={chipProps.label.toString()}
                          />
                        );
                      }}
                      sx={{
                        mt: 2,
                        p: 1,
                      }}
                      validate={validate}
                      value={(
                        parameter.value as string[] | number[] | boolean[]
                      ).map((x) => x.toString())}
                    />
                  );
                }

                return (
                  <div key={parameter.name}>
                    {parameter.name} {parameter.type}
                  </div>
                );
              })}
            </AccordionDetails>
          </Accordion>
        ))}
    </div>
  );
}
