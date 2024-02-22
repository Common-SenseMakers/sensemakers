import { ParserResult } from '../../@shared/parser.types';
import { AppPost, AppPostCreate } from '../../@shared/types';
import { HttpConnector } from '../http.connector';

export const getSemantics = async (
  content: string,
  http: HttpConnector
): Promise<ParserResult> => {
  const data = await http.post('/posts/getSemantics', { content });
  return (data as any).result;
};

export const publishPost = async (
  post: AppPostCreate,
  http: HttpConnector
): Promise<AppPost> => {
  const data = await http.post('/posts/post', post);
  return (data as any).post;
};
