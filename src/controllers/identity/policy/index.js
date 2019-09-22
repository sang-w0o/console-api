import grpcClient from '@lib/grpc-client';
import { changeQueryKeyword } from '@lib/utils';
import logger from '@lib/logger';

const createPolicy = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.Policy.create(params);

    return response;
};

const updatePolicy = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.Policy.update(params);

    return response;
};

const deletePolicy = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.Policy.delete(params);

    return response;
};

const getPolicy = async (params) => {
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.Policy.get(params);

    return response;
};

const listPolicies = async (params) => {
    changeQueryKeyword(params.query, ['policy_id', 'name']);
    let identityV1 = await grpcClient.get('identity', 'v1');
    let response = await identityV1.Policy.list(params);

    return response;
};

export {
    createPolicy,
    updatePolicy,
    deletePolicy,
    getPolicy,
    listPolicies
};
