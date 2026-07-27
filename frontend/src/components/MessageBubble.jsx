// import { User, Bot } from 'lucide-react'
// import Markdown from 'react-markdown'

// function formatTime(iso) {
//   if (!iso) return ''
//   const d = new Date(iso)
//   return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
// }

// function SentimentBadge({ sentiment }) {
//   if (!sentiment || sentiment.sentiment === 'neutral') return null

//   const colors = {
//     happy: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/50',
//     interested: 'bg-blue-50 text-blue-600 ring-1 ring-blue-200/50',
//     frustrated: 'bg-amber-50 text-amber-600 ring-1 ring-amber-200/50',
//     angry: 'bg-red-50 text-red-600 ring-1 ring-red-200/50',
//   }

//   return (
//     <span
//       className={`inline-flex items-center mt-1 text-[10px] leading-none px-2 py-1 rounded-full font-medium ${
//         colors[sentiment.sentiment] || 'bg-gray-50 text-gray-500 ring-1 ring-gray-200/50'
//       }`}
//     >
//       {sentiment.sentiment}
//     </span>
//   )
// }

// function IntentBadge({ intent }) {
//   if (!intent || !intent.intent) return null

//   return (
//     <span className="inline-flex items-center mt-1 text-[10px] leading-none px-2 py-1 rounded-full font-medium bg-violet-50 text-violet-600 ring-1 ring-violet-200/50 mr-1.5">
//       {intent.intent}
//     </span>
//   )
// }

// export default function MessageBubble({ message }) {
//   const isUser = message.role === 'user'

//   return (
//     <div
//       className={`flex gap-3 animate-fade-in-up ${
//         isUser ? 'flex-row-reverse' : ''
//       }`}
//     >
//       <div
//         className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ring-2 ring-white shadow-sm ${
//           isUser
//             ? 'bg-gradient-to-br from-indigo-500 to-indigo-600'
//             : 'bg-gradient-to-br from-gray-100 to-gray-200'
//         }`}
//       >
//         {isUser ? (
//           <User size={14} className="text-white" strokeWidth={2.5} />
//         ) : (
//           <Bot size={14} className="text-gray-500" strokeWidth={2} />
//         )}
//       </div>

//       <div
//         className={`max-w-[78%] min-w-0 ${
//           isUser ? 'items-end' : 'items-start'
//         } flex flex-col`}
//       >
//         <div
//           className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
//             isUser
//               ? 'bg-indigo-600 text-white rounded-br-sm'
//               : 'bg-white text-gray-700 border border-gray-100 rounded-bl-sm shadow-sm shadow-gray-100/50'
//           }`}
//         >
//           {isUser ? (
//             <p className="whitespace-pre-wrap">{message.content}</p>
//           ) : (
//             <div className="prose prose-sm max-w-none">
//               <Markdown>{message.content}</Markdown>
//             </div>
//           )}
//         </div>

//         <div
//           className={`flex items-center gap-1.5 mt-1 px-1 ${
//             isUser ? 'flex-row-reverse' : ''
//           }`}
//         >
//           <span className="text-[10px] text-gray-400 font-medium">
//             {formatTime(message.timestamp)}
//           </span>
//           {!isUser && (
//             <>
//               <IntentBadge intent={message.intent} />
//               <SentimentBadge sentiment={message.sentiment} />
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }









import { User, Bot } from 'lucide-react'
import Markdown from 'react-markdown'


function formatTime(iso) {
  if (!iso) return ''

  const d = new Date(iso)

  return d.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })
}



function SentimentBadge({ sentiment }) {

  if (!sentiment || sentiment.sentiment === 'neutral')
    return null


  const colors = {
    happy:
      'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/50',

    interested:
      'bg-blue-50 text-blue-600 ring-1 ring-blue-200/50',

    frustrated:
      'bg-amber-50 text-amber-600 ring-1 ring-amber-200/50',

    angry:
      'bg-red-50 text-red-600 ring-1 ring-red-200/50'
  }


  return (
    <span
      className={`inline-flex items-center mt-1 text-[10px] px-2 py-1 rounded-full font-medium ${
        colors[sentiment.sentiment] ||
        'bg-gray-50 text-gray-500'
      }`}
    >
      {sentiment.sentiment}
    </span>
  )
}




function IntentBadge({ intent }) {

  if (!intent?.intent)
    return null


  return (
    <span
      className="
      inline-flex items-center mt-1 
      text-[10px] px-2 py-1 
      rounded-full font-medium
      bg-violet-50 text-violet-600
      ring-1 ring-violet-200/50
      "
    >
      {intent.intent}
    </span>
  )
}





function ProductImages({products}) {

  if (!products || products.length === 0)
    return null


  return (

    <div className="mt-4 space-y-4">

      {
        products.map((product,index)=>(

          <div
            key={index}
            className="
            border rounded-xl
            p-3
            bg-white
            "
          >


            {
              product.images?.length > 0 &&

              <div
                className="
                grid grid-cols-2
                gap-2 mb-3
                "
              >

                {
                  product.images.map((img,i)=>(

                    <img
                      key={i}
                      src={img}
                      alt={product.productName}
                      className="
                      w-full
                      h-40
                      object-cover
                      rounded-lg
                      "
                      onError={(e)=>{

                        console.log(
                          "IMAGE ERROR:",
                          img
                        )

                        e.currentTarget.style.display="none"

                      }}
                    />

                  ))
                }

              </div>

            }



            <h3 className="font-semibold">
              {product.productName}
            </h3>


            <p>
              Price: Rs {product.price}
            </p>


            {
              product.colors &&
              <p>
                Colors:
                {product.colors.join(", ")}
              </p>
            }


            {
              product.sizes &&
              <p>
                Sizes:
                {product.sizes.join(", ")}
              </p>
            }


          </div>

        ))
      }


    </div>

  )

}





// Detect image links inside AI response text
function replaceImageLinks(text){

  if(!text)
    return null


  const parts=text.split(
    /(https?:\/\/[^\s]+|\/uploads\/products\/[^\s]+\.jpg)/g
  )


  return parts.map((part,index)=>{


    if(
      part.includes("/uploads/products") ||
      part.startsWith("http")
    ){

      const url =
        part.startsWith("http")
        ?
        part
        :
        `http://localhost:5000${part}`


      return (

        <img
          key={index}
          src={url}
          alt="product"
          className="
          mt-3
          rounded-xl
          max-w-xs
          "
        />

      )

    }


    return (

      <Markdown key={index}>
        {part}
      </Markdown>

    )

  })

}







export default function MessageBubble({message}) {


  console.log(
    "MESSAGE DATA:",
    message
  )


  const isUser =
    message.role === 'user'



  return (

    <div
      className={`
      flex gap-3 animate-fade-in-up
      ${isUser ? 'flex-row-reverse':''}
      `}
    >


      <div
        className={`
        w-7 h-7
        rounded-full
        flex items-center justify-center
        ${
          isUser
          ?
          'bg-indigo-600'
          :
          'bg-gray-200'
        }
        `}
      >

        {
          isUser
          ?
          <User size={14} className="text-white"/>
          :
          <Bot size={14} className="text-gray-500"/>
        }

      </div>





      <div className="max-w-[78%] flex flex-col">


        <div
          className={`
          rounded-2xl
          px-4 py-2.5
          text-sm

          ${
            isUser
            ?
            'bg-indigo-600 text-white'
            :
            'bg-white border'
          }

          `}
        >


          {
            isUser

            ?

            <p className="whitespace-pre-wrap">
              {message.content}
            </p>

            :

            <div className="prose prose-sm max-w-none">


              {
                replaceImageLinks(
                  message.content
                )
              }



              <ProductImages
                products={message.products}
              />


            </div>

          }


        </div>




        <div
          className="
          flex items-center gap-2
          mt-1 px-1
          "
        >

          <span
            className="
            text-[10px]
            text-gray-400
            "
          >
            {formatTime(message.timestamp)}
          </span>


          {
            !isUser &&
            <>
              <IntentBadge
                intent={message.intent}
              />

              <SentimentBadge
                sentiment={message.sentiment}
              />
            </>
          }


        </div>


      </div>


    </div>

  )
}