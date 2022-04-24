import { Link } from 'react-router-dom'
import styled from 'styled-components'

const NotMatch = styled.div``
const GoHome = styled.span``

export default () => {
  return (
    <NotMatch>
      页面走掉了
      <GoHome>
        <Link to="/">点击这里回到首页吧</Link>
      </GoHome>
    </NotMatch>
  )
}
