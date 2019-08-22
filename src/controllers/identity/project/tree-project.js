import grpcClient from '@lib/grpc-client';
import _ from 'lodash';

const getProjectGroups = async (client, params) => {
    let reqParams = {
        _meta: params._meta,
        query: params.query
    };

    if (params.item_type == 'ROOT') {
        reqParams.is_root = true;
    } else {
        reqParams.parent_project_group_id = params.item_id;
    }

    let response = await client.ProjectGroup.list(reqParams);
    let items = [];
    response.results.map((itemInfo) => {
        let item = {
            id: itemInfo.project_group_id,
            name: itemInfo.name,
            has_child: true,
            item_type: 'PROJECT_GROUP'
        };
        items.push(item);
    });

    return items;
};

const getProjects = async (client, params) => {
    if (params.item_type == 'ROOT') {
        return [];
    }

    let reqParams = {
        _meta: params._meta,
        query: params.query,
        project_group_id: params.item_id || null
    };

    let response = await client.Project.list(reqParams);
    let items = [];
    response.results.map((itemInfo) => {
        let item = {
            id: itemInfo.project_id,
            name: itemInfo.name,
            has_child: false,
            item_type: 'PROJECT'
        };
        items.push(item);
    });

    return items;
};

const getParentItem = async (client, itemId, itemType, meta, openItems = []) => {
    let reqParams = {
        _meta: meta,
        query: {
            minimal: false
        }
    };

    if (itemType == 'PROJECT') {
        reqParams.project_id = itemId;
        let response = await client.Project.list(reqParams);

        if (response.total_count == 1) {
            let projectInfo = response.results[0];
            openItems.unshift(projectInfo.project_id);

            let parentItemId = _.get(projectInfo, 'project_group_info.project_group_id');
            if (parentItemId) {

                await getParentItem(
                    client,
                    parentItemId,
                    'PROJECT_GROUP',
                    meta,
                    openItems
                );
            }
        }
    } else {
        reqParams.project_group_id = itemId;
        let response = await client.ProjectGroup.list(reqParams);

        if (response.total_count == 1) {
            let projectGroupInfo = response.results[0];
            openItems.unshift(projectGroupInfo.project_group_id);

            let parentItemId = _.get(projectGroupInfo, 'parent_project_group_info.project_group_id');
            if (parentItemId) {

                await getParentItem(
                    client,
                    parentItemId,
                    'PROJECT_GROUP',
                    meta,
                    openItems
                );
            }
        }
    }

    return openItems;
};

const treeProject = async (params) => {
    if (!params.query) {
        params.query = {};
    }
    params.query.minimal = true;

    if (params.sort) {
        params.query.sort = params.sort;
    }

    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = {
        open_items: [],
        items: []
    };

    if (params.search) {
        response.open_items = await getParentItem(
            identityV1,
            params.search.item_id,
            params.search.item_type,
            params._meta);
    }

    Array.prototype.push.apply(response.items, await getProjectGroups(identityV1, params));
    Array.prototype.push.apply(response.items, await getProjects(identityV1, params));

    return response;
};

export default treeProject;