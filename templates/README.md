# Story Structure Templates

Reference templates for different storytelling frameworks.

## Files

- `Dan_Harmon_Story_Circle_Template.md` — 8-step circular narrative structure

## Built-in Templates (in Story Cards tool)

The `story-cards.html` tool includes **17 templates** with pre-populated story beats:

### Classic Structures
| Template | Description |
|----------|-------------|
| **Three Act Structure** | Classic setup, confrontation, resolution |
| **Save the Cat (Blake Snyder)** | 15 beats for screenwriting |
| **Story Circle (Dan Harmon)** | 8-step circular structure |
| **Hero's Journey** | Campbell's 12 stages |
| **Seven Point Structure** | Key plotting milestones |
| **Freytag's Pyramid** | Five-part dramatic structure |
| **Fichtean Curve** | Crisis-driven, rising action focus |
| **W Plot** | Multiple rises and falls |

### Genre-Specific
| Template | Description |
|----------|-------------|
| **Romancing the Beat** | Gwen Hayes romance structure |
| **Horror Beat Sheet** | Horror-specific pacing |
| **Mystery Beat Sheet** | Whodunit investigation structure |
| **Villain's Journey** | Antagonist-focused storytelling |

### Specialized Methods
| Template | Description |
|----------|-------------|
| **Story Genius (Lisa Cron)** | Internal/misbelief-focused |
| **Story Spine** | Pixar's "Once upon a time..." formula |
| **In Medias Res** | Start in the middle structure |
| **Eight Sequences** | Frank Daniel's screenplay method |
| **Default (Blank)** | Standard structure (no beats) |

## Using Templates

1. Open Story Cards tool
2. Click **Templates** button
3. Select a structure
4. Template loads with acts AND pre-populated story beats
5. Edit beats to fit your story

## Adding Custom Templates

To add a new template to the tool, edit `story-cards.html` and add to the `templates` array:

```javascript
{ 
    name: 'My Template', 
    desc: 'Description', 
    acts: [
        {id:'act1', name:'First Act'},
        {id:'act2', name:'Second Act'}
    ],
    beats: [
        {act:'act1', title:'Opening', desc:'Description of this beat'},
        {act:'act1', title:'Inciting Incident', desc:'What happens'},
        {act:'act2', title:'Climax', desc:'The big moment'}
    ]
}
```
