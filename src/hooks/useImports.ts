import { useEffect, useState } from 'react';

import { useFileSystemProvider } from '../components/providers/FileSystemProvider';
import fonts from '../etc/fonts.json';
import libraries from '../etc/libraries.json';
import WorkspaceFile from '../lib/WorkspaceFile';
import useUrlFileWriter from './useUrlFileWriter';

export default function useImports(urls?: ({ url: string; name?: string })[], autoImport = false) {
  const { files, writeFiles } = useFileSystemProvider();
  const [isLoading, setIsLoading] = useState<boolean>(!!urls);
  const [error, setError] = useState<Error | null>();
  const { write } = useUrlFileWriter();

  useEffect(() => {
    (async () => {
      setIsLoading(true);

      try {
        const decoder = new TextDecoder('utf-8');
        let nfiles;
        if (urls && Array.isArray(urls)) {
          nfiles = urls.map(u => {
            const fileName = u.url.split('/').pop() || 'file';
            return {
              name: fileName,
              url: u.url,
              displayName: u.name
            };
          });
        } else {
          nfiles = [];
        }

        const importedLibraries: string[] = [];
        const importedFonts: string[] = [];

        const downloadedFiles = await Promise.all(
          nfiles.map(async (file) => {
            const response = await fetch(file.url);
            const content = await response.arrayBuffer();
            let name = file.name.split('?')[0]; // Strip possible query string from file name

            // Check if the file extension is missing from the file name. If so,
            // try to guess it from the content type.
            if (!name.includes('.')) {
              const contentType = response.headers.get('Content-Type');

              if (contentType.startsWith('application/zip')) {
                name += '.zip';
              } else if (contentType.startsWith('text/plain')) {
                name += '.scad';
              } else {
                // Everything else is SCAD too, for now.
                name += '.scad';
              }
            }

            // If it is a scad file we can try to look if there are any libraries to import
            if (autoImport && name.endsWith('.scad')) {
              const script = decoder.decode(content);

              // Iterate through known libraries and check if they are used in the file
              for (const library of libraries) {
                // If the library is used, download it and add it to the files
                if (
                  script.includes(library.name) &&
                  !importedLibraries.includes(library.name)
                ) {
                  // Add to imported libraries now, not after promise is resolved. This is
                  // to prevent the same library from being imported multiple times.
                  importedLibraries.push(library.name);

                  await write(
                    library.url,
                    (fileName) =>
                      `libraries/${library.name + fileName.replace(library.trimFromStartPath, '')}`
                  );
                }
              }

              // Iterate through known fonts and check if they are used in the file
              for (const font of fonts) {
                for (const variant of font.variants || []) {
                  if (
                    script.includes(variant) &&
                    !importedFonts.includes(font.name)
                  ) {
                    importedFonts.push(font.name);

                    // If the font is used, download it and add it to the files
                    await write(
                      font.url,
                      (fileName) =>
                        `fonts/${font.name + fileName.replace(font.trimFromStartPath, '')}`
                    );
                  }
                }
              }
            }

            return new WorkspaceFile([content], file.name, {
              path: file.name,
              displayName: file.displayName,
            });
          })
        );

        await writeFiles(downloadedFiles);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [urls]);

  return { error, files, isLoading };
}
