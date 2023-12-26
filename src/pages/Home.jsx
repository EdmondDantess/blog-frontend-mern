import React from 'react'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Grid from '@mui/material/Grid'

import { CommentsBlock, Post, TagsBlock } from '../components'
import { fetchPosts, fetchTags } from '../redux/slices/posts'
import { useDispatch, useSelector } from 'react-redux'

export const Home = () => {
  const dispatch = useDispatch()
  const { posts, tags } = useSelector(state => state.posts)
  const userData = useSelector(state => state.auth.data)

  const postsIsLoading = posts.status === 'loading'
  const tagsIsLoading = tags.status === 'loading'

  React.useEffect(() => {
    dispatch(fetchPosts())
    dispatch(fetchTags())
  }, [])

  return (
    <>
      <Tabs style={{ marginBottom: 15 }} value={0} aria-label='basic tabs example'>
        <Tab label='Новые' />
        <Tab label='Популярные' />
      </Tabs>
      <Grid container spacing={4}>
        <Grid xs={8} item>
          {
            (postsIsLoading
              ? [...Array(5)]
              : posts.items)
              .map((el, index) =>
                postsIsLoading
                  ? (<Post key={index} isLoading={true} />)
                  : (<Post
                    key={index}
                    id={el._id}
                    title={el.title}
                    imageUrl={el.imageUrl
                      ? `http://localhost:4444${el.imageUrl}`
                      : ''
                  }
                    user={el.user}
                    createdAt={el.createdAt}
                    viewsCount={el.viewCount}
                    commentsCount={3}
                    tags={el.tags}
                    isEditable={userData?._id === el.user._id}
                  />),
              )}
        </Grid>
        <Grid xs={4} item>
          <TagsBlock items={tags.items} isLoading={tagsIsLoading} />
          <CommentsBlock
            items={[
              {
                user: {
                  fullName: 'Вася Пупкин',
                  avatarUrl: 'https://mui.com/static/images/avatar/1.jpg',
                },
                text: 'Это тестовый комментарий',
              },
              {
                user: {
                  fullName: 'Иван Иванов',
                  avatarUrl: 'https://mui.com/static/images/avatar/2.jpg',
                },
                text: 'When displaying three lines or more, the avatar is not aligned at the top. You should set the prop to align the avatar at the top',
              },
            ]}
            isLoading={false}
          />
        </Grid>
      </Grid>
    </>
  )
}
