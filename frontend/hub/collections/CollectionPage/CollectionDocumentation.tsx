import { Drawer, DrawerContent, DrawerContentBody } from '@patternfly/react-core';
import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useBreakpoint } from '../../../../framework';
import { useGet } from '../../../common/crud/useGet';
import { pulpAPI } from '../../common/api/formatPath';
import { CollectionVersionSearch, IContents } from '../Collection';
import { CollectionDocumentationTabContent } from '../components/CollectionDocumentationTabContent';
import { CollectionDocumentationTabPanel } from '../components/CollectionDocumentationTabPanel';

export function CollectionDocumentation() {
  const { collection } = useOutletContext<{ collection: CollectionVersionSearch }>();

  const [content, setContent] = useState<IContents>();

  const { data } = useGet<CollectionVersionsContent>(
    pulpAPI`/content/ansible/collection_versions/?namespace=${
      collection?.collection_version?.namespace || ''
    }&name=${collection?.collection_version?.name || ''}&version=${
      collection?.collection_version?.version || ''
    }&offset=0&limit=1`
  );

  const groups = useMemo(() => {
    const groups: Record<string, { name: string; contents: IContents[] }> = {};
    if (data) {
      for (const content of data.results[0].docs_blob.contents) {
        let group = groups[content.content_type];
        if (!group) {
          group = {
            name: content.content_type.charAt(0).toUpperCase() + content.content_type.slice(1),
            contents: [],
          };
          groups[content.content_type] = group;
        }
        group.contents.push(content);
      }
    }
    for (const group of Object.values(groups)) {
      group.contents = group.contents.sort((l, r) => l.content_name.localeCompare(r.content_name));
    }
    return Object.values(groups);
  }, [data]);

  const [isDrawerOpen, setDrawerOpen] = useState(true);
  const lg = useBreakpoint('lg');

  return (
    <Drawer isExpanded={isDrawerOpen} isInline={lg} position="left">
      <DrawerContent
        panelContent={
          isDrawerOpen ? (
            <CollectionDocumentationTabPanel
              setDrawerOpen={setDrawerOpen}
              groups={groups}
              content={content}
              setContent={setContent}
            />
          ) : undefined
        }
      >
        <DrawerContentBody>
          <CollectionDocumentationTabContent
            content={content}
            isDrawerOpen={isDrawerOpen}
            setDrawerOpen={setDrawerOpen}
          />
        </DrawerContentBody>
      </DrawerContent>
    </Drawer>
  );
}

export type CollectionVersionContentItem = {
  docs_blob: {
    contents: IContents[];
    collection_readme: {
      html: string;
      name: string;
    };
  };
  license: string[];
};

export type CollectionVersionsContent = {
  count: number;
  next: string;
  previous: string;
  results: CollectionVersionContentItem[];
};
