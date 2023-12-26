import React from 'react'
import TextField from '@mui/material/TextField'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import SimpleMDE from 'react-simplemde-editor'

import 'easymde/dist/easymde.min.css'
import styles from './AddPost.module.scss'
import { useSelector } from 'react-redux'
import { selectIsAuth } from '../../redux/slices/auth'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import instance from '../../axios'

export const AddPost = () => {
  const isAuth = useSelector(selectIsAuth)
  const { id } = useParams()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = React.useState(false)
  const [imageUrl, setImageUrl] = React.useState('')
  const [value, setValue] = React.useState('')
  const [title, setTitle] = React.useState('')
  const [tags, setTags] = React.useState('')
  const inputFileRef = React.useRef(null)

  const isEditing = Boolean(id)

  const handleChangeFile = async (e) => {
    try {
      const formData = new FormData()
      const file = e.target.files[0]
      formData.append('image', file)
      const { data } = await instance.post('/upload', formData)
      setImageUrl(data.url)
      console.log(data)
    } catch (e) {
      console.warn(e)
      alert('Ошибка при загрузке файла')
    }
  }

  const onClickRemoveImage = () => {
    setImageUrl('')
  }

  const onChange = React.useCallback((value) => {
    setValue(value)
  }, [])

  React.useEffect(() => {
    if (id) {
      instance.get(`/posts/${id}`)
        .then(({ data }) => {
          setTitle(data.title)
          setValue(data.text)
          setTags(data.tags.join(','))
          setImageUrl(data.imageUrl)
        })
        .catch(e => {
          console.warn(e)
          alert('Ошибка при получении статьи')
        })
    }
  }, [])

  const options = React.useMemo(
    () => ({
      spellChecker: false,
      maxHeight: '400px',
      autofocus: true,
      placeholder: 'Введите текст...',
      status: false,
      autosave: {
        enabled: true,
        delay: 1000,
      },
    }),
    [],
  )

  const onSubmit = async () => {
    try {
      setIsLoading(true)

      const fields = {
        title, imageUrl, tags: tags, text: value,
      }
      const { data } = isEditing
        ? await instance.patch(`/posts/${id}`, fields)
        : await instance.post('/posts', fields)

      const _id = isEditing
        ? id
        : data._id

      navigate(`/posts/${_id}`)
    } catch (e) {
      console.warn(e)
      alert('Ошибка при создании статьи!')
    }
  }

  if (!window.localStorage.getItem('token') && !isAuth) {
    return <Navigate to={'/'} />
  }

  return (
    <Paper style={{ padding: 30 }}>
      <Button onClick={() => inputFileRef.current.click()} variant='outlined' size='large'>
        Загрузить превью
      </Button>
      <input ref={inputFileRef} type='file' onChange={handleChangeFile} hidden />
      {imageUrl && (
        <>
          <Button variant='contained' color='error' onClick={onClickRemoveImage}>
            Удалить
          </Button>
          <img className={styles.image} src={`http://localhost:4444${imageUrl}`} alt='Uploaded' />
        </>
      )}
      <br />
      <br />
      <TextField
        classes={{ root: styles.title }}
        variant='standard'
        placeholder='Заголовок статьи...'
        value={title}
        onChange={e => setTitle(e.target.value)}
        fullWidth
      />
      <TextField
        classes={{ root: styles.tags }}
        variant='standard'
        placeholder='Тэги'
        value={tags}
        onChange={e => setTags(e.target.value)}
        fullWidth />
      <SimpleMDE className={styles.editor} value={value} onChange={onChange} options={options} />
      <div className={styles.buttons}>
        <Button onClick={onSubmit} size='large' variant='contained'>
          {isEditing ? 'Сохранить' : 'Опубликовать'}
        </Button>
        <Link to='/'>
          <Button size='large'>Отмена</Button>
        </Link>
      </div>
    </Paper>
  )
}
